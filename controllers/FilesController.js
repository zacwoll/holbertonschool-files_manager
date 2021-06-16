import { ObjectID } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Queue from 'bull'
import dbClient from '../utils/db';

class FilesController {
    static async postUpload(request, response) {
        // Retrieve the user based on the token

        // A file needs
        // name as filename
        // type (folder/file/image)
        // parentId (optional) as ID of the parent (default 0-> root)
        // isPublic (optional) as boolean to define if the file is public or not (default: false)
        // data (oly for type=file|image) as Base64 of the file content

        // If a file has all of that, the userID should be added to the document and saved in DB as owner of a file
        // if the type is folder add the new file document in the db and return the new file with 201

        // Else
        // All files will be stored locally in a folder created automatically
        // -> the relative folder path given by FOLDER_PATH
        // -> if this variable isn't here put it in /tmp/files_manager
        // Create a local path in the storing folder with filename as UUID
        // Store the file in decrypted base64 in this local path
        // add the new file document in the collection files with attributes:
        // userId, name, type, isPublic, parentId, localPath

        // Return the new file with a status code 201

    }
}

module.exports = FilesController;