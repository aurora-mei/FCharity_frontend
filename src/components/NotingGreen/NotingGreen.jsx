import { Flex } from 'antd';
import React from 'react';
const NotingGreen = ({ message, style, bgColor }) => {
    return (
        <Flex justify='center' align='center' className='sth-green' style={{ backgroundColor: bgColor }}>
            <p style={{ whiteSpace: 'pre-line', ...style }}>{message}</p>
        </Flex>
    );
}
export default NotingGreen;