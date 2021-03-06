import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import { Redirect } from "react-router-dom";
import {
  Container,
  Input,
  Grid,
  Button,
  Message,
  Dimmer,
  Loader,
  Confirm,
  Popup,
  Icon,
  Progress,
} from "semantic-ui-react";
import MenuBar from "./MenuBar";
import { saveBlog } from "../actions/blogs";
import { connect } from "react-redux";

const CreatePosts = (props) => {
  const { dispatch, blogs } = props;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [editorEditable, setEditorEditable] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [message, setMessage] = useState("Title is a required field");
  const [isContentEmpty, setIsContentEmpty] = useState(false);
  const [isTitleEmpty, setIsTitleEmpty] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let timeout, interval;
    //Showing the redirect message and the green bar progress to make the point that redirect is going to happen soon
    if (blogs.postSave.started && blogs.postSave.finished) {
      timeout = setTimeout(() => {
        setRedirect(true);
      }, 1500);
      interval = setInterval(() => {
        if (percent >= 100) {
          setPercent(100);
        } else {
          setPercent((prev) => prev + 0.67);
        }
      }, 10);
    }
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [blogs]);

  //Editor instance initialized with the update function to render again when the change is made by the user
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content,
    editable: editorEditable,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
  });

  //Open Modal to Confirm if the post is correct or not
  const openConfirmModal = () => {
    if (content === "") {
      setMessage("Content is a required field");
      setIsContentEmpty(true);
      setTimeout(() => {
        setIsContentEmpty(false);
      }, 1000);
    }
    if (title === "") {
      setMessage("Title is a required field");
      setIsTitleEmpty(true);
      setTimeout(() => {
        setIsTitleEmpty(false);
      }, 1000);
    }
    if (title !== "" && content !== "") {
      setIsContentEmpty(false);
      setIsTitleEmpty(false);
      setMessage("");
      setConfirmModal(true);
    }
  };

  //Handling the confirmation of the Blog that is to be posted
  const handleSubmit = (e) => {
    if (title && content) {
      dispatch(saveBlog(title, content));
      setEditorEditable(false);
    }
  };

  //Resetting the whole text editor
  const handleReset = (e) => {
    editor.commands.setContent("");
    editor.commands.focus();
    setContent("");
  };

  //Redirect if the redirect state is true
  if (redirect) return <Redirect to="/" />;

  //If the progress is happening, then return the loader action
  if (blogs.inProgress)
    return (
      <Container>
        <Dimmer active>
          <Loader />
        </Dimmer>
      </Container>
    );

  return (
    <div>
      {blogs.error && <div className="alert error-dailog">{blogs.error}</div>}
      <Container
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Input
          fluid
          placeholder="Enter Blog Title...."
          style={{ marginBottom: "15px" }}
          onChange={(e) => setTitle(e.target.value)}
          className={isTitleEmpty ? "red-border" : ""}
        />
        <MenuBar editor={editor} />
        {editor && (
          <BubbleMenu editor={editor}>
            <Button.Group basic size="small" style={{ background: "black" }}>
              <Button
                icon
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "is-active" : ""}
                size="mini"
                inverted
                color="blue"
                basic
              >
                <Icon name="bold" />
              </Button>
              <Button
                icon
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "is-active" : ""}
                size="mini"
                inverted
                color="blue"
                basic
              >
                <Icon name="italic" />
              </Button>
              <Button
                icon
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive("codeBlock") ? "is-active" : ""}
                size="mini"
                inverted
                color="blue"
                basic
              >
                <Icon name="code" />
              </Button>
            </Button.Group>
          </BubbleMenu>
        )}
        <Grid
          columns={16}
          container
          style={{
            margin: "30px 0 0 0",
            border: "1px solid rgba(34,36,38,.15)",
            borderRadius: ".28571429rem",
          }}
        >
          <EditorContent
            editor={editor}
            style={{
              minHeight: "400px",
              width: "100%",
              caretColor: "red",
            }}
            className={isContentEmpty ? "red-border" : ""}
          />
        </Grid>
        {!blogs.postSave.started && !blogs.postSave.finished ? (
          <Button.Group>
            <Button onClick={(e) => handleReset(e)}>Reset</Button>
            <Button.Or />
            {message !== "" ? (
              <Popup
                content={message}
                on="click"
                pinned
                trigger={
                  <Button
                    positive
                    onClick={(e) => openConfirmModal(e)}
                    disabled={blogs.inProgress}
                  >
                    Create Post
                  </Button>
                }
              />
            ) : (
              <Button
                positive
                onClick={(e) => openConfirmModal(e)}
                disabled={blogs.inProgress}
              >
                Create Post
              </Button>
            )}
            <Confirm
              open={confirmModal}
              onCancel={() => setConfirmModal(false)}
              onConfirm={(e) => handleSubmit(e)}
            />
          </Button.Group>
        ) : blogs.error ? (
          <div className="alert error-dailog">{blogs.error}</div>
        ) : (
          <Container>
            <Progress percent={percent} indicating success size="tiny" />
            <Message>
              <Message.Header>
                Post Saved and Redirecting to Home Page.....
              </Message.Header>
            </Message>
          </Container>
        )}
      </Container>
    </div>
  );
};

function mapStateToProps(state) {
  return { ...state };
}

export default connect(mapStateToProps)(CreatePosts);
