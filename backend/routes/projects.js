const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../utils/cloudinary');

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /projects — Create a new project
router.post('/', upload.single('icon'), async (req, res) => {
    try {
        const { name, description, techStack, progress, github } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Project name is required' });
        }

        let iconUrl = '';

        if (req.file) {
            // Upload to Cloudinary using a stream
            iconUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'devtrack_projects' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );
                stream.end(req.file.buffer);
            });
        }

        let parsedTechStack = [];
        if (techStack) {
            // If sent from FormData, techStack might be a stringified array or comma-separated string
            try {
                parsedTechStack = JSON.parse(techStack);
            } catch (e) {
                // If not JSON, try splitting by comma (already handled on frontend ideally)
                parsedTechStack = typeof techStack === 'string' ? techStack.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(techStack) ? techStack : []);
            }
        }

        const project = await Project.create({
            userId: req.user.id,
            name: name.trim(),
            description: description ? description.trim() : '',
            techStack: parsedTechStack,
            progress: typeof progress === 'number' ? progress : parseInt(progress) || 0,
            github: github ? github.trim() : '',
            iconUrl,
            totalHours: 0,
        });

        res.status(201).json(project);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error creating project' });
    }
});

// GET /projects — Get all projects for the user
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching projects' });
    }
});

// PATCH /projects/:id — Update a project
router.patch('/:id', upload.single('icon'), async (req, res) => {
    try {
        const { name, description, techStack, progress, github, notes, totalHours } = req.body;

        const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (name !== undefined && name.trim() !== '') project.name = name.trim();
        if (description !== undefined) project.description = description.trim();

        if (techStack !== undefined) {
            try {
                project.techStack = JSON.parse(techStack);
            } catch (e) {
                project.techStack = typeof techStack === 'string' ? techStack.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(techStack) ? techStack : []);
            }
        }

        if (notes !== undefined) {
            try {
                project.notes = JSON.parse(notes);
            } catch (e) {
                project.notes = Array.isArray(notes) ? notes : [];
            }
        }

        if (progress !== undefined) project.progress = parseInt(progress) || 0;
        if (github !== undefined) project.github = github.trim();
        if (totalHours !== undefined && typeof totalHours === 'number') project.totalHours = totalHours;

        if (req.file) {
            // Upload new icon to Cloudinary using a stream
            const iconUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'devtrack_projects' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );
                stream.end(req.file.buffer);
            });
            project.iconUrl = iconUrl;
        }

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating project' });
    }
});

// DELETE /projects/:id — Delete a project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting project' });
    }
});

module.exports = router;
