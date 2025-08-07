import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import CodeEditor from "./components/CodeEditor";
import UsersPane from "./components/UserPane";
import type { JSX } from "react";
type User = {
  id: string;
  name: string;
};

const socket: Socket = io("http://localhost:3001");

function App(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    socket.on("users", (data: User[]) => {
      setUsers(data);
    });

    return () => {
      socket.off("users");
    };
  }, []);

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      <UsersPane users={users} />
      <div className="flex-1">
        <CodeEditor />
      </div>
    </div>
  );
}

export default App;
