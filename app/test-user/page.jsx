import { checkUser } from "@/lib/checkUser";

export default async function TestUserPage() {
  const user = await checkUser();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Test Page</h1>

      {user ? (
        <div>
          <h2 className="text-xl mb-2">User found:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      ) : (
        <div>
          <p className="text-red-500">No user found. Please sign in.</p>
        </div>
      )}
    </div>
  );
}
