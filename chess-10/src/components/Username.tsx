import { useState } from 'react';
import { useHistory } from 'react-router-dom';

function Username() {
  const [username, setUsername] = useState('');
  const history = useHistory();

  const handleCreateRoom = () => {
    if (username) {
      console.log('Creating room with username:', username);
      // Add your create room logic here
    } else {
      console.log('Please enter a username.');
    }
  };

  const handleJoinRoom = () => {
    if (username) {
      console.log('Joining room with username:', username);
      // Add your join room logic here
      history.push('/select-lobby');
    } else {
      console.log('Please enter a username.');
    }
  };


  return (
    <>
      <div className="px-96 flex items-center justify-center w-screen ">
        <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-md shadow-md">
          <div className="w-72">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded-md"
              onClick={handleCreateRoom}
            >
              Create Room
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleJoinRoom}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Username