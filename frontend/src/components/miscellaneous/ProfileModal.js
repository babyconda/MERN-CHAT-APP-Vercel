import { useDisclosure } from "@chakra-ui/hooks";
import { ViewIcon } from "@chakra-ui/icons";
import { TbCameraPlus, TbPencil } from "react-icons/tb";
import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai";
// import { Spinner } from "@chakra-ui/react";
import {
  Button,
  IconButton,
  // Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Image, Text } from "@chakra-ui/react";
import "./profile.css";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({ fetchAgain, setFetchAgain, user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [showPencil, setShowPencil] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [pic, setPic] = useState(null);
  const [name, setName] = useState(userData?.name);

  const toast = useToast();

  const { setUser } = ChatState();

  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem("userInfo"));
    setUserData(localData);
  }, []);

  const updateName = async () => {
    if (!name) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.patch(
        `/api/user/${userData?._id}`,
        { name },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUserData(data);
      setUser(data);
      setLoading(false);
      setIsEditing(!isEditing);
    } catch (error) {
      console.log(error);
    }
  };

  const clearFields = () => {
    onClose();
    setName(userData?.name);
    setIsEditing(false);
    setImage(null);
    setPic(null);
  };

  const postImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
    postDetails(e.target.files[0]);
  };

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "newChat");
      data.append("cloud_name", "premyadav");
      fetch("https://api.cloudinary.com/v1_1/premyadav/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  const updateProfile = async () => {
    if (!pic) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.patch(
        `/api/user/profile/${userData?._id}`,
        { pic },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUserData(data);
      setUser(data);
      setLoading(false);
      setIsEditing(!isEditing);
      setPic(null);
      setIsEditing(false);
      onClose();
      // setFetchAgain(!fetchAgain);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}
      <Modal size="lg" isOpen={isOpen} onClose={clearFields} isCentered>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Word sans"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {!isEditing ? (
              <>
                {user?.name}
                {userData?._id === user?._id ? (
                  <TbPencil
                    className="editName"
                    size="30px"
                    onClick={() => setIsEditing(!isEditing)}
                  />
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                <input
                  placeholder="Enter Name..."
                  className="nameInput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <AiOutlineClose
                  className="closeUpdate"
                  onClick={() => setIsEditing(!isEditing)}
                />
                <AiOutlineCheck className="checkUpdate" onClick={updateName} />
              </>
            )}
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              className="editImage"
              borderRadius="full"
              boxSize="150px"
              src={image ? image : user.pic}
              alt={user.name}
            />

            {userData?._id === user?._id ? (
              <>
                <label htmlFor="img">
                  <TbCameraPlus className="cameraIcon" />
                </label>
                <input
                  id="img"
                  type={"file"}
                  style={{ display: "none" }}
                  onChange={(e) => postImage(e)}
                />
              </>
            ) : (
              <></>
            )}

            {userData?._id === user?._id ? (
              <Button
                size="sm"
                mt="20px"
                mb="5px"
                bg="#38b2ac"
                color="white"
                onClick={updateProfile}
                isLoading={loading}
              >
                Upload Image
              </Button>
            ) : (
              <></>
            )}

            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
            >
              Email:{user.email}
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} mt="-10px" onClick={clearFields}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
