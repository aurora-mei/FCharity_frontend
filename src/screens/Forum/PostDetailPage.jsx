import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPostsById } from "../../redux/post/postSlice";
import { Layout, Typography, Card, Spin,Carousel  } from "antd";
import LeftSidebar from "../../components/Sidebar/LeftSidebar";
import RightSidebar from "../../components/Sidebar/RightSidebar";
const { Content } = Layout;
const { Title, Text,Paragraph } = Typography;
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import {Avatar ,Badge} from "antd";
import { LikeOutlined,MessageOutlined ,ShareAltOutlined  } from "@ant-design/icons";
const PostDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const  currentPost = useSelector((state) => state.post.currentPost);
    const loading = useSelector((state) => state.post.loading);

    useEffect(() => {
        console.log("PostDetailPage Mounted - ID:", id);
        if (id) {
            dispatch(fetchPostsById(id));
        }
    }, [dispatch, id]);
    const title = currentPost?.post?.title || "Loading...";
    const createdAt = currentPost?.post?.createdAt || "";
    const vote = currentPost?.post?.vote || 0;
    const attachments = currentPost?.attachments || [];
    const taggables = currentPost?.taggables || [];

    const imageUrls = attachments?.filter((url) =>
        url.match(/\.(jpeg|jpg|png|gif)$/i)
      ) || [];
      const videoUrls = attachments.filter((url) =>
        url.match(/\.(mp4|webm|ogg)$/i)
      ) || [];
    
      const carouselSettings = {
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
      };
 

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
        <LeftSidebar /> {/* ✅ Sidebar bên trái */}
        <Content style={{ background: "#fff", flex: 1, padding: "20px", display: "flex", justifyContent: "center" }}>
            {loading ? <Spin size="large" /> : (
                <Card style={{ maxWidth: "100vh", width: "100%" }} bordered={false}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                        <Avatar size={40} src="https://storage.googleapis.com/a1aa/image/SLsiBjM7A_DiXERy7RrXPTFtwY4VT43xrUyrYl05oF8.jpg" />
                        <div style={{ marginLeft: "8px" }}>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>r/post</div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>{createdAt}</div>
                        </div>
                    </div>
                    <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>{title}</h2>
                    {/* <Badge count="Vocabulary / Semantics" color="red" style={{ marginBottom: "16px" }} /> */}
                    {taggables?.length > 0 && (
            <Paragraph className="request-tags">
              {currentPost.taggables.map((taggable) => (
                <Badge key={taggable.tag.id} color="blue">
                  #{taggable.tag.tagName} <span> </span>
                </Badge>
              ))}
            </Paragraph>
          )}
                    {/* <Card style={{ backgroundColor: "#e5e7eb", padding: "16px", borderRadius: "8px" }}>
                        image
                    </Card> */}
                     {/* Carousel ảnh/video ngay dưới tiêu đề */}
        {(imageUrls.length > 0 || videoUrls.length > 0) && (
          <div className="request-carousel">
            <Carousel arrows  {...carouselSettings}>
              {imageUrls.map((url, index) => (
                <div key={`img-${index}`} className="media-slide">
                  <img src={url} alt={`request-img-${index}`} />
                </div>
              ))}
              {videoUrls.map((url, index) => (
                <div key={`vid-${index}`} className="media-slide">
                  <video src={url} controls />
                </div>
              ))}
            </Carousel>
          </div>
        )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", color: "#6b7280", fontSize: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <LikeOutlined />
                            <span>{vote}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <MessageOutlined />
                            <span>0</span>
                            <ShareAltOutlined />
                            <span>Share</span>
                        </div>
                    </div>
                </Card>
            )}
        </Content>
        <RightSidebar /> 
    </Layout>
    
    );
};

export default PostDetailPage;