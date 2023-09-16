import { useState } from 'react';
import { useHistory } from 'react-router-dom';


function Username() {
  const [username, setUsername] = useState('');
  const history = useHistory();

  const handleCreateRoom = () => {
    if (username) {
      console.log('Creating room with username:', username);
      history.push('/create');
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
        <div className="flex flex-col items-center space-y-4  p-6 rounded-md ">
          <div className="w-72">
            <label htmlFor="username" className="flex items-center justify-center text-sm font-medium text-white">
              <p>USERNAME</p>
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className=" bg-transparent mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none  sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              className="coolBeans"
              onClick={handleCreateRoom}
            >
              Create Room
            </button>
            <button
              type="button"
              className="coolBeans"
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