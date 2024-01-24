import {initializeApp} from "firebase/app";
import {getStorage, listAll, ref, getMetadata, getDownloadURL} from "firebase/storage";
import * as database from "firebase/database";
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import fs from 'fs';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6TB3KIRLIc0kVpps1A9ugtcY0qQP5L_E",
    authDomain: "enes100-ml-models.firebaseapp.com",
    projectId: "enes100-ml-models",
    storageBucket: "enes100-ml-models.appspot.com",
    messagingSenderId: "434134653480",
    appId: "1:434134653480:web:218d18208513377b01331d",
    databaseURL: "https://enes100-ml-models-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const rootref = ref(storage, '/');


// This file will be ran. It should inifnitely watch for files in the firebase storage.
// On startup, it should list files and see which ones need to be updated.
// It will then listen to the realtimedatabase. When the root updates, it will check the files again.

const outputdir = './models/';

async function downloadFile(filename) {
    const downloadURL = await getDownloadURL(ref(storage, filename));
    const destination = outputdir + filename;
    const res = await fetch(downloadURL);
    const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function check() {
    console.log('Executing check');
    // Check the files in the storage and update the database accordingly
    const res = await listAll(rootref);
    const files =  res.items;
    for (const file of files) {
        const metadata = await getMetadata(file);
        // console.log(metadata.name, new Date(metadata.updated).getTime(), metadata.size);
        const localfile = outputdir + metadata.name;
        if (fs.existsSync(localfile)) {
            const stats = fs.statSync(localfile);
            const localtime = stats.mtimeMs;
            if (localtime < new Date(metadata.updated).getTime()) {
                console.log('Downloading ' + metadata.name, 'because local time is ' + localtime + ' and remote time is ' + new Date(metadata.updated).getTime())
                await downloadFile(metadata.name);
            } else {
                console.log('Skipping ' + metadata.name, 'because local time is ' + localtime + ' and remote time is ' + new Date(metadata.updated).getTime())
            }
        } else {
            console.log('Downloading ' + metadata.name, 'because it does not exist locally');
            await downloadFile(metadata.name);
        }
    }
}

// Listen for changes in the database
database.onValue(database.ref(database.getDatabase(), '/'), (snapshot) => {
    const data = snapshot.val();
    console.log('Database changed', data);
    check();
});

// Do nothing but this onValue, forever
await new Promise(() => {});