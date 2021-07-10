import React from "react";
import Posts from "./Posts";
import { Grid, Container } from "semantic-ui-react";
import { useEffect } from "react";
import { clearErrorState, clearPostSaveState } from "../actions/blogs";

const PostContainer = (props) => {
  console.log("props in post conatiner", props);
  const { dispatch, blogs } = props;
  const { list } = props.blogs;
  useEffect(() => {
    //Clearing all states on redirect
    dispatch(clearErrorState());
    dispatch(clearPostSaveState());
  }, []);
  return (
    <div>
      {blogs.error && <div className="alert error-dailog">{blogs.error}</div>}
      <Container fluid style={{ padding: "10px 0" }}>
        <Grid>
          {list.map((blog) => (
            <Grid.Column key={blog._id} width={16} style={{ padding: "5px 0" }}>
              <Posts blog={blog} />
            </Grid.Column>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default PostContainer;
