const Contact = require('../models/Contact');

exports.addContact = async (req, res) => {
    const { user_id, name, phone } = req.body;
    try {
        const newContact = new Contact({
            user_id,
            name,
            phone
        });
        await newContact.save();
        res.status(201).json({ message: 'Contact added successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getContacts = async (req, res) => {
    const { user_id } = req.params;
    try {
        const contacts = await Contact.find({ user_id });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContact = async (req, res) => {
    const { id } = req.params;
    try {
        await Contact.findByIdAndDelete(id);
        res.json({ message: 'Contact deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
