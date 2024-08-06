const express = require('express');
const router = express.Router();
const Source = require('../models/Source');

/**
 * @route GET /sources/:workspaceId
 * @description Create a new source for the given workspace ID
 */
router.get('/sources/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    // Create and save the new  source
    const newSource = await Source.create({
      workspace_id: workspaceId,
      name: 'Database Source - test -2',
      type: 'Database - test-2',
      configuration: {},
    });

    res.status(201).json(newSource);
  } catch (error) {
    console.error('Error creating source:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /sources/:workspaceId/:sourceId
 * @description Update a source for the given workspace and source ID
 */
router.get('/sources/:workspaceId/:sourceId', async (req, res) => {
  try {
    const { workspaceId, sourceId } = req.params;

    // Update the source
    const updatedSource = await Source.findByIdAndUpdate(
      sourceId,
      { name: 'Updated API Source', type: 'API', configuration: { updated: true } },
      { new: true, runValidators: true }
    );

    if (!updatedSource) {
      return res.status(404).json({ message: 'Source not found' });
    }

    res.status(200).json(updatedSource);
  } catch (error) {
    console.error('Error updating source:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /sources/:workspaceId/:sourceId/delete
 * @description Delete a source for the given workspace and source ID
 */
router.get('/sources/:workspaceId/:sourceId/delete', async (req, res) => {
  try {
    const { workspaceId, sourceId } = req.params;

    // Find and delete the source
    const deletedSource = await Source.findByIdAndDelete(sourceId);

    if (!deletedSource) {
      return res.status(404).json({ message: 'Source not found' });
    }

    res.status(200).json({ message: 'Source deleted successfully' });
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
