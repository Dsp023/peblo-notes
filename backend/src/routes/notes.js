const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');
const { generateAiInsights } = require('../services/ai');

const router = express.Router();

// Get all notes for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      include: { tags: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, isPublic } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        isPublic: isPublic || false,
        userId: req.user.id,
        tags: {
          create: tags?.map((tag) => ({ name: tag })) || [],
        },
      },
      include: { tags: true },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get a single note
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { tags: true },
    });

    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Update a note
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, isPublic } = req.body;

    // First check if note exists and belongs to user
    const existingNote = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!existingNote || existingNote.userId !== req.user.id) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update note and recreate tags
    // For simplicity, we delete old tags and recreate them
    await prisma.tag.deleteMany({ where: { noteId: req.params.id } });

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        isPublic,
        tags: {
          create: tags?.map((tag) => ({ name: tag })) || [],
        },
      },
      include: { tags: true },
    });

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const existingNote = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!existingNote || existingNote.userId !== req.user.id) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await prisma.note.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// AI Processing
router.post('/:id/ai/process', authMiddleware, async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { summary, actionItems, suggestedTitle } = await generateAiInsights(note.content);

    const updatedNote = await prisma.note.update({
      where: { id: note.id },
      data: {
        summary,
        actionItems: JSON.stringify(actionItems),
        title: suggestedTitle || note.title,
      },
      include: { tags: true }
    });

    res.json(updatedNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process AI insights' });
  }
});

module.exports = router;
