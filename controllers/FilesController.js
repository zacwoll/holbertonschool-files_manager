import { ObjectID } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Queue from 'bull'
import dbClient from '../utils/db';
import { findUserIdByToken } from '../utils/helpers';

class FilesController {
    static async postUpload(request, response) {
        const fileQueue = new Queue('fileQueue');
        // Retrieve the user based on the token
        const userId = await findUserIdByToken(request);
        if (!userId) return response.status(401).json({error: 'Unauthorized'});
        // Basic variables get filled in from the request
        const { name, type, data } = request.body;
        let { parentId, isPublic } = request.body;
        let fileInserted;

        // Validate the request data
        if (!name) return response.status(400).json({error: 'Missing name'});
        if (!type || ['folder', 'file', 'image'].indexOf(type) === -1) return response.status(401).json({ error: 'Missing type' });

        // parentId (optional) as ID of the parent (default 0-> root)
        if (!parentId) parentId = 0;
        else {
            const parentFileArray = await dbClient.files.find({ _id: ObjectID(parentId) }).toArray();
            if (parentFileArray.length === 0) return response.status(400).json({ error: 'Parent not found' });
            const file = parentFileArray[0];
            if (file.type !== 'folder') return response.status(400).json({ error: 'Parent is not a folder' });
        }

        // is the file public?
        if (!isPublic) isPublic = false;

        // if no data, and not a folder, error
        if (!data && type !== 'folder') return response.status(400).json({ error: 'Missing Data' });

        // if type is folder than insert into DB, owner is ObjectID(userId)
        if (type === 'folder') {
            fileInserted = await dbClient.files.insertOne({
                userId: ObjectID(userId),
                name,
                type,
                isPublic,
                parentId: parentId === 0 ? parentId : ObjectID(parentID),
            });

        // if not folder, store file in DB unscrambled
        } else {
            // Create a folder for this file
            const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true}, err => {});
            // the actual location is the root computer 'C:/tmp/files_manager

            // Create an ID and a new path to the new file
            const filenameUUID = uuidv4();
            const localPath = `${folderPath}/${filenameUUID}`;

            // Unscramble data and write to new path
            const clearData = Buffer.from(data, 'base64');
            await fs.promises.writeFile(localPath, clearData.toString(), { flag: 'w+' });
            await fs.readdirSync('/').forEach(file => {
                console.log(file);
              });

            // Insert into the DB
            fileInserted = await dbClient.files.insertOne({
                userId: ObjectID(userId),
                name,
                type,
                isPublic,
                parentId: parentId === 0 ? parentId : ObjectID(parentId),
                localPath,
            });

            // if the file is an image, save it in binary
            if (type === 'image') {
                await fs.promises.writeFile(localPath, clearData, { flag: 'w+', encoding: 'binary' });
                await fileQueue.add({ userId, fileId: fileInserted.insertedId, localPath })
            }
        }

        // Return the new file with a status code 201
        return response.status(201).json({
            id: fileInserted.ops[0]._id, userId, name, type, isPublic, parentId,
        });
    }
    static async getShow(request, response) {
        // Retrieve the user based on the token
        const userId = await findUserIdByToken(request);
        if (!userId) return response.status(401).json({error: 'Unauthorized'});

        // Find the document linked to the userID
    }

    static async getIndex() {

    }
}

module.exports = FilesController;