


import { useContext, useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";
import { api } from "../api";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:4040");
const colors = ["#0f0f0fff"];
const userColors = {};

export default function Chat() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [chatWith, setChatWith] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef();

  const getUserColor = (userId) => {
    if (!userColors[userId]) {
      userColors[userId] = colors[Object.keys(userColors).length % colors.length];
    }
    return userColors[userId];
  };

 
  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      const res = await api.get("/users");
      setUsers(res.data.filter((u) => u._id !== user._id));
    };
    fetchUsers();
  }, [user]);

 
  useEffect(() => {
    if (!user) return;
    socket.emit("registerUser", user._id);

    const handleReceive = (msg) => {
    
      if (
        (msg.sender === user._id && msg.receiver === chatWith?._id) ||
        (msg.sender === chatWith?._id && msg.receiver === user._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [user, chatWith]);


  const loadMessages = useCallback(async () => {
    if (!chatWith || !user) return;
    const res = await api.get(`/messages/${user._id}/${chatWith._id}`);
    setMessages(res.data);
  }, [chatWith, user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  
  const sendMessage = async () => {
    if (!text.trim() || !chatWith) return;
    const newMessage = { sender: user._id, receiver: chatWith._id, text };

   
    setMessages((prev) => [...prev, newMessage]);
    setText("");

   
    socket.emit("sendMessage", newMessage);

  
    try {
      await api.post("/messages", newMessage);
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    socket.disconnect();
    navigate("/", { replace: true });
  };

  if (!user) return <p>Loading...</p>;

  
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4" style={{ maxWidth: "1300px" }}>
    
    <nav className="navbar navbar-expand-lg bg-primary mb-3 rounded sticky-top">
     <div className="container-fluid">
     <span className="navbar-brand">Welcome, {user.name}</span>
     <button className="btn btn-danger" onClick={handleLogout}>  Logout </button>
        </div>
      </nav>

      <div className="row">
       
        <div className="col-4 border-end">
          <h5>Users</h5>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          <ul className="list-group">
            {filteredUsers.map((u) => (
              <li
                key={u._id}
                className={`list-group-item ${
                  chatWith?._id === u._id ? "active" : ""
                }`}
                onClick={() => setChatWith(u)}
                style={{
                  cursor: "pointer",
                  color:
                    chatWith?._id === u._id ? "white" : getUserColor(u._id),
                  fontWeight: chatWith?._id === u._id ? "bold" : "normal",
                }} >
                {u.name}
              </li>
            ))}
          </ul>
        </div>

        
     <div className="col-8 d-flex flex-column">
     {chatWith ? (
      <>
      <h5 className="border-bottom pb-2 mb-2"> Chat with {chatWith.name}  </h5>
     <div
         className="flex-grow-1 overflow-auto mb-3 p-2 border rounded"
         style={{ height: "400px", background: "#f8f9fa" }} >
        {messages.map((msg, index) => {
        const isMe = (msg.sender?._id || msg.sender) === user._id;
         return (
     <div
           key={index}
           className={`d-flex mb-2 ${
           isMe ? "justify-content-end" : "justify-content-start"
             }`}  >

        <div
            className="p-2 rounded"
           style={{
            maxWidth: "70%",
           backgroundColor: isMe ? "#007bff" : "#e9ecef",
           color: isMe ? "white" : "black",
           }} >
          {msg.text}
       </div>
       </div>
         );
        })}
       <div ref={messagesEndRef} />
        </div>

       <div className="input-group">
         <input
            value={text}
            onChange={(e) => setText(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="form-control"  />
       <button onClick={sendMessage} className="btn btn-primary">  Send  </button>
          </div>
        </>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
}
