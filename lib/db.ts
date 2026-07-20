import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { Part, Build } from "./types";

export const updatePart = async (partId: string, updates: Partial<Part>) => {
  const docRef = doc(db, "parts", partId);
  await updateDoc(docRef, updates);
};

export const getParts = async (): Promise<Part[]> => {
  const q = query(collection(db, "parts"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Part);
};

export const getBuilds = async (userId: string): Promise<Build[]> => {
  const q = query(collection(db, "builds"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Build);
};

export const saveBuild = async (build: Build) => {
  const docRef = doc(db, "builds", build.id);
  await setDoc(docRef, build);
};

export const deleteBuild = async (buildId: string) => {
  const docRef = doc(db, "builds", buildId);
  await deleteDoc(docRef);
};
