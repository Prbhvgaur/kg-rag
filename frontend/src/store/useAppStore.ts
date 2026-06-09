import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ChatMessage, Document } from "../types";

interface AppStore {
  documents: Document[];
  messages: ChatMessage[];
  addDocument: (doc: Document) => void;
  addMessage: (message: ChatMessage) => void;
  clearDocuments: () => void;
  clearMessages: () => void;
  resetStore: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      documents: [],
      messages: [],
      addDocument: (doc) =>
        set({
          documents: [doc, ...get().documents.filter((entry) => entry.doc_id !== doc.doc_id)]
        }),
      addMessage: (message) => set({ messages: [...get().messages, message] }),
      clearDocuments: () => set({ documents: [] }),
      clearMessages: () => set({ messages: [] }),
      resetStore: () => set({ documents: [], messages: [] })
    }),
    { name: "kg-rag-store" }
  )
);
