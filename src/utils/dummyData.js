// src/dummyData.js
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Source = require('../models/Source');
const UnreadNotification = require('../models/UnreadNotification');

const dummyData = async () => {
    try {
        // Clear existing data
        // if (User && Workspace && Source && UnreadNotification) {
        //     await User.deleteMany({});
        //     await Workspace.deleteMany({});
        //     await Source.deleteMany({});
        //     await UnreadNotification.deleteMany({});
        // }
        // // Add workspaces
        const workspace1 = await Workspace.create({ name: 'Workspace 1' });
        const workspace2 = await Workspace.create({ name: 'Workspace 2' });
        const workspace3 = await Workspace.create({ name: 'Workspace 3' });


        // Add users
        const user1 = await User.create({ name: 'Ali Khan', email: 'ali.khan@example.com', workspace_ids: [workspace1._id, workspace3._id] });
        const user2 = await User.create({ name: 'Sara Ahmed', email: 'sara.ahmed@example.com', workspace_ids: [workspace1._id] });
        const user3 = await User.create({ name: 'Ahmed Malik', email: 'ahmed.malik@example.com', workspace_ids: [workspace2._id, workspace3._id] });
        const user4 = await User.create({ name: 'Fatima Ali', email: 'fatima.ali@example.com', workspace_ids: [workspace2._id] });


        // Update workspaces to include users
        await Workspace.findByIdAndUpdate(workspace1._id, { user_ids: [user1._id, user2._id] });
        await Workspace.findByIdAndUpdate(workspace2._id, { user_ids: [user3._id, user4._id] });
        await Workspace.findByIdAndUpdate(workspace3._id, { user_ids: [user1._id, user3._id] });

        // Add sources
        await Source.create({ workspace_id: workspace1._id, name: 'Database Source', type: 'Database', configuration: {} });
        await Source.create({ workspace_id: workspace1._id, name: 'API Source', type: 'API', configuration: {} });
        await Source.create({ workspace_id: workspace2._id, name: 'File Source', type: 'File', configuration: {} });
        await Source.create({ workspace_id: workspace3._id, name: 'Streaming Source', type: 'Streaming', configuration: {} });

        console.log('Dummy data inserted successfully');
    } catch (error) {
        console.error('Error inserting dummy data:', error);
        process.exit(1);
    }
};

module.exports = dummyData;
