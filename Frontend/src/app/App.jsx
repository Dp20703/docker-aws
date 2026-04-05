import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { useState } from "react";
import { useEffect } from "react";

const App = () => {
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  const [users, setUsers] = useState([]);

  const editorRef = useRef(null);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;

    new MonacoBinding(
      yText,
      editorRef?.current?.getModel(),
      new Set([editorRef.current]),
    );
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({}, "", "?username=" + e.target.username.value);
  };

  useEffect(() => {
    if (username) {
      const provider = new SocketIOProvider(
        "http://localhost:3000",
        "monaco",
        ydoc,
        {
          autoConnect: true,
        },
      );

      provider.awareness.setLocalStateField("user", { username });
      const states = Array.from(provider?.awareness?.getStates().values());
      console.log("states:", states);
      setUsers(
        states
          .filter((state) => state.user && state.user.username)
          .map((state) => state.user),
      );

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values());
        setUsers(
          states
            .filter((state) => state.user && state.user.username)
            .map((state) => state.user),
        );
      });
      const handleBeforeUnload = () => {
        provider.awareness.setLocalStateField("user", null);
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        provider.disconnect();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [username,ydoc]);

  if (!username) {
    console.log("username:", username);
    return (
      <main className="h-screen w-full bg-gray-950 p-4 flex justify-center items-center gap-4">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            name="username"
            className="p-2 text-xl text-white border border-gray-500 rounded-lg"
          />
          <button className="p-2 text-xl text-black bg-amber-100 rounded-lg">
            Join
          </button>
        </form>
      </main>
    );
  }

  const colors = [
    "#ef4444", // red
    "#3b82f6", // blue
    "#22c55e", // green
    "#f59e0b", // yellow
    "#a855f7", // purple
  ];

  const getUserColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash += username.charCodeAt(i);
    }
    return colors[hash % colors.length];
  };
  return (
    <main className="h-screen w-full bg-gray-950 p-4 flex gap-4">
      <aside className="h-full w-1/4 bg-emerald-50 rounded-lg">
        <h2 className="p-4 text-2xl font-bold border-b border-gray-300">
          Users
        </h2>
        <ul className="p-4">
          {users.map((user, idx) => (
            <li
              key={idx}
              className="p-2 bg-gray-800 text-white rounded mb-2 flex items-center gap-2"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getUserColor(username) }}
              ></span>
              {user.username === username ? "You" : user.username}
            </li>
          ))}
        </ul>
      </aside>

      <section className="w-3/4 bg-neutral-800 rounded-lg ">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
};

export default App;
