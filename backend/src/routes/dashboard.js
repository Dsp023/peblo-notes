const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalNotes = await prisma.note.count({ where: { userId } });

    // Recent notes (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyEdited = await prisma.note.count({
      where: {
        userId,
        updatedAt: { gte: sevenDaysAgo }
      }
    });

    // Most used tags
    const tags = await prisma.tag.groupBy({
      by: ['name'],
      where: { note: { userId } },
      _count: { name: true },
      orderBy: { _count: { name: 'desc' } },
      take: 5
    });

    // AI Usage Stats (count of notes with summaries generated)
    const aiUsageCount = await prisma.note.count({
      where: {
        userId,
        summary: { not: null }
      }
    });

    res.json({
      totalNotes,
      recentlyEdited,
      mostUsedTags: tags.map(t => ({ name: t.name, count: t._count.name })),
      aiUsageCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard insights' });
  }
});

module.exports = router;
