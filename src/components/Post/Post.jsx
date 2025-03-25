import React, { useEffect, useState } from "react";
import { List, Avatar, Typography, Card, Carousel, Input, Button, Tag, Dropdown, Menu } from "antd";
import { LikeOutlined, MessageOutlined, ShareAltOutlined, SendOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Paragraph } = Typography;


const Post = ({ currentPost }) => {
    const navigate = useNavigate();

    // State cho việc chỉnh sửa comment
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    useEffect(() => {
        console.log("Dữ liệu nhận được:", currentPost);
    }, [currentPost]);

    if (!currentPost || !currentPost.post) {
        return <Card bordered={false}>Loading...</Card>;
    }

    // Lấy dữ liệu bài post
    const { title, createdAt, vote, content, tags } = currentPost.post;
    // Giả sử thông tin người đăng nằm trong currentPost.post.user
    const { user } = currentPost.post;
    const attachments = currentPost?.attachments || [];
    const initialComments = currentPost?.comments || [];

    // State quản lý comment
    const [newComment, setNewComment] = useState("");
    const [commentList, setCommentList] = useState(initialComments);

    const handleCommentSubmit = () => {
        if (newComment.trim() === "") return;
        const newCommentData = {
            id: Date.now(),
            author: "Current User",
            avatar: "https://via.placeholder.com/40",
            content: newComment.trim(),
            likes: 0,
            createdAt: new Date().toISOString(),
        };
        setCommentList([newCommentData, ...commentList]);
        setNewComment("");
    };

    // Xử lý like cho bình luận
    const handleLike = (id) => {
        setCommentList(
            commentList.map((comment) =>
                comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment
            )
        );
    };

    // Xử lý reply cho bình luận (demo: console log)
    const handleReply = (id) => {
        console.log("Reply to comment id:", id);
    };

    // Xử lý xóa bình luận
    const handleDelete = (id) => {
        setCommentList(commentList.filter((comment) => comment.id !== id));
    };

    // Bắt đầu chỉnh sửa bình luận
    const handleEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
    };

    // Lưu nội dung chỉnh sửa
    const handleSaveEdit = (id) => {
        setCommentList(
            commentList.map((comment) =>
                comment.id === id ? { ...comment, content: editingContent } : comment
            )
        );
        setEditingCommentId(null);
        setEditingContent("");
    };

    // Menu dropdown cho các hành động: Delete, Update, Report
    const menu = (comment) => (
        <Menu>
            <Menu.Item onClick={() => handleDelete(comment.id)}>Delete</Menu.Item>
            <Menu.Item onClick={() => handleEdit(comment)}>Update</Menu.Item>
            <Menu.Item onClick={() => console.log("Report comment id:", comment.id)}>
                Report
            </Menu.Item>
        </Menu>
    );

    // Tách ảnh & video từ attachments
    const imageUrls =
        attachments.filter((url) => url.match(/\.(jpeg|jpg|png|gif)$/i)) || [];
    const videoUrls =
        attachments.filter((url) => url.match(/\.(mp4|webm|ogg)$/i)) || [];

    // Cài đặt Carousel
    const carouselSettings = {
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    // Xử lý kiểu dữ liệu của tags: nếu là chuỗi, chuyển thành mảng; nếu là mảng, dùng luôn
    let tagList = [];
    if (typeof tags === "string") {
        tagList = tags.split(",").map((tag) => tag.trim());
    } else if (Array.isArray(tags)) {
        tagList = tags;
    }
    console.log("Tags sau khi xử lý:", tagList);

    return (
        <Card bordered={false} style={{ maxWidth: 800, margin: "auto", marginTop: 20 }}>
            {/* Header: Avatar, tên người đăng và ngày giờ */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <Avatar
                    src={user && user.avatar ? user.avatar : "https://via.placeholder.com/40"}
                    size={40}
                />
                <div style={{ marginLeft: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {user && user.fullName ? user.fullName : "Unknown User"}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {moment(createdAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                </div>
            </div>

            {/* Tiêu đề bài post */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h2>

            {/* Hiển thị Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {tagList.map((tag, index) => (
                            <span key={tag.id}>
                                <div className="donation-badge">
                                    {tag.tag.tagName}
                                </div>
                            </span>
                ))}
            </div>

            {/* Nội dung bài post */}
            {/* <Paragraph>{content}</Paragraph> */}
            <Paragraph>
            The fundamentals of how to ask for donations online
1. Give transparency into details about your story
As the saying goes, honesty is the best policy. People want to trust that their donations are going toward a legitimate cause. Be honest in telling your story to reassure those who are looking to help. If a donor connects with your story they will be more willing to donate. Encourage potential donors to visit your fundraiser page to get more details—and to become part of your journey with their donation. To learn more about storytelling, take a look at our guide on crafting a compelling fundraiser story.

2. Be specific in your ask
Providing people with specific information is a strong way to grab their attention. Give potential donors clear-cut reasons why they should donate to your cause. In your ask, be sure to break down these three things:

Your current situation.
The reason why you’re fundraising.
Your desired outcome.
LIST ADDITIONAL EXPENSES
Be specific in your list of expenses as well. Some ways to be specific include using numbers, making a checklist, and listing additional costs. It can also be effective to get specific with the requested amounts. For example, “A $125 donation will allow Jenny to fill one month’s prescriptions.”

Some successful fundraisers itemize every expense—not just a big-ticket item like surgery or funeral, but the gas money needed for rides to the doctor, transportation fees for a hearse or van, and other, smaller expenses. Potential donors will appreciate transparency.

3. Create a sense of urgency
It’s important to convey a sense of urgency when sharing your fundraiser. Without that urgency, your potential donors may consider waiting to donate—requiring you to ask them again down the line. Explain what will happen if you don’t raise the money in a certain amount of time, and you’ll likely see a spike in donations. Keep in mind that even negative consequences can still be framed in a positive light. Our blog on the psychology of giving is a good resource to reference for similar tips.

4. Be thoughtful in your outreach
The best way to receive a positive response—and a donation—is to appeal to potential donors’ interests. If you know someone who would respond better to a warm, lighthearted request, keep your wording to ask for donations informal and bright. For someone such as a colleague who may respond better to a formal approach, deliver your message accordingly.

You might be nervous about asking for help. It’s good to know that even people who regularly organize fundraisers still get nervous. Requesting donations online can be made easier by using a mental checklist and practicing your approach. Here are a few tips on how to ask for donations.

PERSONALIZE YOUR REQUEST
When you ask for donations, focus on more than just the need. Also think about the types of donors you’re asking, and what their understanding and needs might be. When approaching a potential donor, ask yourself:

Why does this person care? There is a reason you reached out to them for donations. Keep that reason in mind, and communicate it when you approach each potential donor.
What relationship does this person have with the beneficiary? Maybe an individual is a family member of the beneficiary. A tip for how to ask for money from family is to bring up this relationship when asking for donations. This is to create more personal, intimate communication and boost your chances of getting a donation. Touching on the relationship is important to do with anyone you ask, whether they’re a childhood friend or neighbor.
Why would they have reservations? Keep in mind reasons someone might not want to donate, and try to address them. For example, some people may worry they can’t afford to make a large enough donation to make a difference. By addressing this concern and listing specific expenses that can be paid with small donations, you can get more people to contribute.
TRY A FUNDRAISING LETTER
Sending a personal fundraising letter to potential donors can increase the number of donations you receive. This may sound time-consuming, but it’s effective. It separates your message from the dozens of spam requests a person might receive. It also shows that your request is about more than money—it’s about the relationship.

5. Use text messages and email to your advantage
One major strength of text messages and email: You can ask friends and family to forward or copy and paste the non-personalized portion of the message to their own circle. Consider crafting a block of text they can easily use for that purpose, and calling it out as such in your text message or email. Additionally, email is great for online fundraising without social media since it’s efficient, low-cost, and easy to track your progress. Successfully reach your fundraising goals by taking advantage of these fundraising email templates.

6. Make it easy to donate
While this is obvious, it can be easy to forget: Make it easy for people to make a donation. Include the link to your donation page in your ask, and don’t be afraid to point out exactly where the donation button is located on your fundraiser.

7. Try other creative ways to ask for donations
You don’t need to use a formula when it comes to crafting your donation requests. Veering away from traditional formulas will make your fundraiser stand out. Just make sure the approach you choose fits your fundraiser and motivates people to get involved. Here are some innovative examples of how to ask for donations:

Start your request with the beneficiary’s favorite poem or song lyric.
Include images or videos to make your ask more emotionally compelling.
Address the common fears and myths about crowdfunding to provide clarity and reassurance to donors before pitching your request.
REJECTION IS INEVITABLE, BUT THAT’S OKAY
You won’t get a donation from every person you ask, and that’s okay. It doesn’t mean that you did a bad job. Sometimes people get distracted or they don’t have the money to donate. Understanding this, politely follow up with anyone who didn’t donate the first time you reached out. You can also suggest other ways they can show support for free, such as sharing your fundraiser on their online social networks. Make it simpler for them by providing some pointers on how to ask for donations on social media. Using social media fundraising is a big opportunity to turn followers into donors.

8. Show gratitude to your donors
Let your donors know you appreciate them by thanking them for their donations. Whether you write a donation thank you letter or choose another way to say thank you to donors, a small gesture of gratitude can go a long way in maintaining relationships and even encouraging repeat donations.

The financial support you need is on the other side of fear 
Above all, remember that people enjoy helping others. When you ask for donations, you’re simply tapping into that human impulse. Check out our fundraising ideas to see how GoFundMe makes it easy to raise money for yourself, someone you know, or a cause that is near and dear to your heart. Now that you know the basics of asking for donations, you can start a fundraiser today and begin raising donations tomorrow.
            </Paragraph>

            {/* Ảnh / Video nếu có */}
            {attachments.length > 0 && (
              <div className="request-carousel" style={{ position: 'relative' }}>
                           <Carousel arrows  {...carouselSettings} style={{ position: 'relative', borderRadius: 10 }}>
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

            {/* Like - Comment - Share */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    color: "#6b7280",
                    fontSize: 14,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <LikeOutlined style={{ cursor: "pointer" }} />
                    <span>{vote}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MessageOutlined style={{ cursor: "pointer" }} />
                    <span>{commentList.length}</span>
                    <ShareAltOutlined style={{ cursor: "pointer" }} />
                    <span>Share</span>
                </div>
            </div>

            {/* Form nhập comment */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Avatar src="https://via.placeholder.com/40" />
                <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleCommentSubmit}
                    style={{
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                    }}
                />
            </div>

            {/* Danh sách bình luận */}
            <List
                itemLayout="vertical"
                dataSource={commentList}
                locale={{ emptyText: "No comments yet" }}
                renderItem={(comment) => (
                    <List.Item style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <List.Item.Meta
                            avatar={<Avatar src={comment.avatar} />}
                            title={
                                <div>
                                    <span style={{ fontWeight: "bold" }}>{comment.author}</span>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        {moment(comment.createdAt).format("DD/MM/YYYY HH:mm")}
                                    </div>
                                </div>
                            }
                            description={
                                editingCommentId === comment.id ? (
                                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                        <Input
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={() => handleSaveEdit(comment.id)}
                                            style={{
                                                backgroundColor: "#1890ff", // Màu nền xanh giống nút Send
                                                borderColor: "#1890ff",
                                            }}
                                        >
                                            Save
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setEditingCommentId(null);
                                                setEditingContent("");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Paragraph style={{ marginBottom: 8 }}>{comment.content}</Paragraph>
                                )
                            }
                        />
                        {/* Các hành động Like, Reply, More */}
                        <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#6b7280" }}>
              <span onClick={() => handleLike(comment.id)} style={{ cursor: "pointer" }}>
                <LikeOutlined /> {comment.likes}
              </span>
                            <span onClick={() => handleReply(comment.id)} style={{ cursor: "pointer" }}>
                Reply
              </span>
                            <Dropdown overlay={menu(comment)} trigger={["click"]}>
                                <MoreOutlined style={{ cursor: "pointer" }} />
                            </Dropdown>
                        </div>
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default Post;
