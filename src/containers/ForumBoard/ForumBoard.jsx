
import { Flex, Row, Col } from "antd";
import "./ForumBoard.pcss";
import { RightOutlined } from '@ant-design/icons';
import ProjectCard from "../../components/ProjectCard/ProjectCard";

const ForumBoard = () => {
    return (
        <Flex vertical gap="20px">
            <b style={{ fontSize: "1.4rem" }}>Charity Forum</b>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <div className="forum-intro">
                        <div className="text-overlay-forum">
                            <div>Unite, share, and make a difference</div>
                        </div>
                    </div>
                </Col>
                <Col span={16}>
                    <Flex vertical gap='20px'>
                        <img src="./src/assets/communicate.jpg" alt="" className="img-forum" />
                        <Flex gap="10px" justify="space-between" align="center">
                            <ProjectCard />
                            <ProjectCard />
                            <ProjectCard />
                        </Flex>
                    </Flex>
                </Col>
            </Row>
        </Flex>
    );
};

export default ForumBoard;
