import  type {JSX} from "react";
type User = {
  id: string;
  name: string;
};

interface Props {
  users: User[];
}

export default function UsersPane({ users }: Props): JSX.Element {
  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-semibold mb-2">Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="py-1">
            👤 {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
