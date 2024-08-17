"use client";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { firestore, storage } from "@/firebase";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Modal,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "@firebase/firestore";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";
import WebcamCapture from "../app/components/WebcamCapture.js";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openWebcam, setOpenWebcam] = useState(false);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenWebcam = () => setOpenWebcam(true);
  const handleCloseWebcam = () => setOpenWebcam(false);

  const handleCapture = async (imageSrc) => {
    // Upload image to Firebase Storage
    const storageRef = ref(storage, `images/${new Date().toISOString()}.jpg`);
    await uploadString(storageRef, imageSrc, "data_url");

    const downloadURL = await getDownloadURL(storageRef);

    // Call your image classification function here
    classifyImage(downloadURL);
    handleCloseWebcam();
  };

  const classifyImage = async (imageURL) => {
    try {
      // Replace with your image classification API call
      const response = await fetch("/api/classify-image", {
        method: "POST",
        body: JSON.stringify({ imageURL }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      // Update Firebase with classification result
      const docRef = doc(collection(firestore, "inventory"), "classified_image");
      await setDoc(docRef, { classification: result.classification });
    } catch (error) {
      console.error("Error classifying image:", error);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100%"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      padding={4}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={openWebcam}  
        onClose={handleCloseWebcam}  
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" textAlign={"center"}>
            Capture Image
          </Typography>
          <WebcamCapture onCapture={handleCapture} />
        </Box>
      </Modal>

      <Typography
        variant="h2"
        color={"#333"}
        textAlign={"center"}
        marginBottom={4}
      >
        Inventory Tracker
      </Typography>

      <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ marginBottom: 4, maxWidth: "800px" }}
      />

      <Button variant="contained" onClick={handleOpen} sx={{ marginBottom: 4 }}>
        Add New Item
      </Button>

      <Button variant="contained" onClick={handleOpenWebcam} sx={{ marginBottom: 4 }}>  {/* Add this button */}
        Capture Image
      </Button>

      <Grid container spacing={4} justifyContent="center">
        {filteredInventory.map(({ name, quantity }) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Card sx={{ maxWidth: 345 }}>
              <CardMedia>
                <Image
                  src="/inventory.png"
                  alt={name}
                  layout="responsive"
                  width={345}
                  height={140}
                />
              </CardMedia>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {quantity}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => addItem(name)}
                >
                  Add
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
