const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: {
        tags: true,
        user: { select: { name: true } }
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (!note.isPublic) {
      return res.status(403).json({ error: 'This note is not public' });
    }

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shared note' });
  }
});

module.exports = router;
