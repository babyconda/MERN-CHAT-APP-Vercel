import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSender, getSenderFull, getSenderImage } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
// import Lottie from "lottie-react";
// import mikeLitecky from "../animations/typing.json";
import { BsFillEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // const [inputStr, setInputStr] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loggedUser, setLoggedUser] = useState("");
  // const { chats, setChats } = ChatState();

  const toast = useToast();

  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    // chats,
    setChats,
  } = ChatState();

  const handleEmojiClick = (event) => {
    setNewMessage((prevInput) => prevInput + event.native);
  };

  const handleEmojiPickerHideShow = () => {
    setShowPicker((val) => !val);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat", config);

      setChats(data);
    } catch (error) {
      toast({
        titile: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const sendMessage = async (event) => {
    // Send or Enter
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const sendMessageViaButton = async (event) => {
    // Send or Enter
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  //   console.log(selectedChat);

  return (
    <>
      {selectedChat ? (
        <>
          <div className="title-main">
            <IconButton
              display={{ base: "flex", md: "none" }}
              // position="absolute"
              // left={{ base: "2", md: "10" }}
              marginLeft={0}
              p={0}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            <div className="profile">
              <div className="profile-Images">
                {!selectedChat.isGroupChat ? (
                  <img
                    src={getSenderImage(loggedUser, selectedChat.users)}
                    alt="UserImage"
                  />
                ) : (
                  <img src={selectedChat.picOfGroup} alt="GroupImage" />
                )}
              </div>
              <div className="name-message">
                {!selectedChat?.isGroupChat ? (
                  <>{getSender(user, selectedChat.users)}</>
                ) : (
                  <>{selectedChat.chatName.toUpperCase()}</>
                )}
                {isTyping ? (
                  <Text
                    fontSize={14}
                    ml={1}
                    fontWeight={400}
                    marginTop={"-5px"}
                  >
                    typing...
                  </Text>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="edit-model">
              {!selectedChat.isGroupChat ? (
                <>
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                </>
              ) : (
                <>
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                </>
              )}
            </div>
          </div>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <BsFillEmojiSmileFill
                  fontSize="30"
                  color="#38B2AC"
                  onClick={handleEmojiPickerHideShow}
                />
                {showPicker && (
                  <div
                    style={{
                      height: 210,
                      marginTop: -700,
                      position: "absolute",
                    }}
                  >
                    <Picker data={data} onEmojiSelect={handleEmojiClick} />
                  </div>
                )}

                <Input
                  variant="filled"
                  width="90%"
                  m="10px"
                  bg="#E0E0E0"
                  placeholder="   Enter a message..."
                  onChange={typingHandler}
                  value={newMessage}
                />

                <Button
                  size="sm"
                  height="45px"
                  width="45px"
                  bgColor="#38B2AC"
                  borderRadius="50%"
                  // onClick={sendMessageViaButton}
                >
                  <IoMdSend
                    fontSize="30px"
                    color="white"
                    onClick={sendMessageViaButton}
                  />
                </Button>
              </div>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting...
            
          </Text>
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            OR
            
          </Text>
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Search "Prem Yadav" to Drop me Message...
            
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
