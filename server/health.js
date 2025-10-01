// Health check endpoint for Render
module.exports = (req, res) => {
    res.status(200).send('OK');
};