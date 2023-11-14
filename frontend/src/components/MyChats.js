import { Button, useToast } from "@chakra-ui/react";
import { Box, Stack, Text } from "@chakra-ui/layout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender, getSenderImage } from "../config/ChatLogics";
import GroupChatModel from "./miscellaneous/GroupChatModal";
import "./myChat.css";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState("");
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

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

  return (
    <>
      <Box
        display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
        flexDirection="column"
        alignItems="center"
        p={3}
        bg="white"
        w={{ base: "100%", md: "31%" }}
        borderRadius="lg"
        borderWidth="1px"
      >
        <Box
          pb={3}
          px={3}
          fontSize={{ base: "28px", md: "30px" }}
          fontFamily="Work sans"
          display="flex"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          My Chats
          <GroupChatModel>
            <Button
              display="flex"
              fontSize={{ base: "17px", md: "10px", lg: "17px" }}
              rightIcon={<AddIcon />}
            >
              New Group Chat
            </Button>
          </GroupChatModel>
        </Box>

        <Box
          p={3}
          bg="#F8F8F8"
          w="100%"
          h="100%"
          borderRadius="lg"
          overflowY="hidden"
        >
          {chats ? (
            <Stack overflowY="scroll">
              {chats.map((chat) => (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                  position={"relative"}
                >
                  <div className="side-profle-main">
                    <div className="profile-Image">
                      {!chat.isGroupChat ? (
                        <>
                          <img
                            src={getSenderImage(loggedUser, chat.users)}
                            alt="userImage"
                          />
                        </>
                      ) : (
                        <img src={chat?.picOfGroup} alt="groupImage" />
                      )}
                    </div>
                    <div className="text-message">
                      <div className="text-date">
                        <Text
                          fontWeight={500}
                          whiteSpace={"nowrap"}
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          {!chat.isGroupChat
                            ? getSender(loggedUser, chat.users)
                            : chat.chatName}
                        </Text>

                        <Text position={"absolute"} right={3} fontSize={12}>
                          {chat?.updatedAt
                            .slice(0, 10)
                            .split("-")
                            .reverse()
                            .join("/")}
                        </Text>
                      </div>

                      <Text fontSize={14}>
                        {chat?.latestMessage ? (
                          chat.latestMessage.content
                        ) : (
                          <></>
                        )}
                      </Text>
                    </div>
                  </div>
                </Box>
              ))}
            </Stack>
          ) : (
            <ChatLoading />
          )}
        </Box>
      </Box>
    </>
  );
};

export default MyChats;
