import {initializeApp} from "firebase/app";
import {getStorage, listAll, ref, uploadBytesResumable} from "firebase/storage";
import {type Writable, writable} from "svelte/store";

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

export type UploadState = {
    state: 'idle' | 'uploading' | 'done' | 'error',
    progress: number,
    error?: string,
}
export const progress: Writable<UploadState> = writable({
    state: 'idle',
    progress: 0,
});

export async function listStorage(): Promise<string[]> {
    // Create a reference under which you want to list
    // Find all the prefixes and items.
    const res = await listAll(rootref);
    return res.items.map((itemRef) => itemRef.name);
}

export async function uploadFile(filename: string, file: File): Promise<void> {
    // Create a root reference
    const uploadTask = uploadBytesResumable(ref(storage, '/' + filename), file)
    await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is', p, '% done.');
                progress.set({state: 'uploading', progress: p});
            },
            (error) => {
                console.log(error);
                progress.set({state: 'error', progress: 0, error: error.message});
                reject(error);
            },
            () => {
                progress.set({state: 'done', progress: 100});
                resolve();
            }
        );
    });
}