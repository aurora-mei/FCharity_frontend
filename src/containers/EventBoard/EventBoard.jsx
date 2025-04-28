import { Flex, Carousel } from "antd";
import "./EventBoard.pcss";
import { RightOutlined } from '@ant-design/icons';

const EventBoard = () => {
    return (
        <Flex vertical gap="20px">
            <b style={{ fontSize: "1.4rem" }}>Feature Events</b>
            <div className="carousel-container">
                <Carousel autoplay autoplaySpeed={4000}>
                    <div>
                        <Flex gap="0" justify="space-between" align="center">
                            <div className="left-content">
                                <div className="text-overlay">
                                    #FireAtAtlantic
                                </div>
                            </div>
                            <Flex vertical justify="center" gap='40px' className="right-content">
                                <Flex vertical justify="center" gap='10px'>
                                    <b style={{ fontSize: '1.4rem' }}>How to help: FireAtAtlantic</b>
                                    <p style={{ color: 'gray', fontSize: '1rem' }}>At Morpht, we've expanded the Paragraphs concept, developing a suite of supporting
                                        Drupal modules that enhance base functionality and offer site builders easy wins with ready-to-use Paragraph bundles.</p>
                                </Flex>
                                <a href="./" style={{ color: 'black', fontSize: '1rem' }}> <b>Donate now <RightOutlined style={{ fontSize: '0.7rem' }} /></b></a>
                            </Flex>
                        </Flex>
                    </div>
                    <div>
                        <Flex gap="0" justify="space-between" align="center">
                            <div className="left-content">
                                <div className="text-overlay">
                                    #FireAtAtlantic
                                </div>
                            </div>
                            <Flex vertical justify="center" gap='40px' className="right-content">
                                <Flex vertical justify="center" gap='10px'>
                                    <b style={{ fontSize: '1.4rem' }}>How to help: FireAtAtlantic</b>
                                    <p style={{ color: 'gray', fontSize: '1rem' }}>At Morpht, we've expanded the Paragraphs concept, developing a suite of supporting
                                        Drupal modules that enhance base functionality and offer site builders easy wins with ready-to-use Paragraph bundles.</p>
                                </Flex>
                                <a href="./" style={{ color: 'black', fontSize: '1rem' }}> <b>Donate now <RightOutlined style={{ fontSize: '0.7rem' }} /></b></a>
                            </Flex>
                        </Flex>
                    </div>
                    <div>
                        <Flex gap="0" justify="space-between" align="center">
                            <div className="left-content">
                                <div className="text-overlay">
                                    #FireAtAtlantic
                                </div>
                            </div>
                            <Flex vertical justify="center" gap='40px' className="right-content">
                                <Flex vertical justify="center" gap='10px'>
                                    <b style={{ fontSize: '1.4rem' }}>How to help: FireAtAtlantic</b>
                                    <p style={{ color: 'gray', fontSize: '1rem' }}>At Morpht, we've expanded the Paragraphs concept, developing a suite of supporting
                                        Drupal modules that enhance base functionality and offer site builders easy wins with ready-to-use Paragraph bundles.</p>
                                </Flex>
                                <a href="./" style={{ color: 'black', fontSize: '1rem' }}> <b>Donate now <RightOutlined style={{ fontSize: '0.7rem' }} /></b></a>
                            </Flex>
                        </Flex>
                    </div>
                </Carousel>

            </div>
        </Flex>
    );
};

export default EventBoard;
