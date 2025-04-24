import React from 'react';
import { Typography } from 'antd';
// Import thư viện lịch bạn chọn, ví dụ: react-big-calendar
// import { Calendar, dayjsLocalizer } from 'react-big-calendar';
// import dayjs from 'dayjs';
// import 'react-big-calendar/lib/css/react-big-calendar.css';

// Hoặc dùng Calendar của Antd
import { Calendar as AntdCalendar, Badge } from 'antd';
import dayjs from 'dayjs';
const { Title } = Typography;

// const localizer = dayjsLocalizer(dayjs); // Cần thiết cho react-big-calendar

const TaskCalendarTab = ({ tasks = [] }) => {

    // --- Xử lý dữ liệu task thành events cho calendar ---
    const events = tasks
        .filter(task => task.startTime || task.endTime) // Chỉ lấy task có ngày
        .map(task => ({
            id: task.id,
            title: task.taskName,
            start: task.startTime ? dayjs(task.startTime).toDate() : dayjs(task.endTime).toDate(), // Cần Date object
            end: task.endTime ? dayjs(task.endTime).add(1, 'day').toDate() : dayjs(task.startTime).add(1,'day').toDate(), // End thường là exclusive hoặc cần +1 ngày nếu là sự kiện cả ngày
            allDay: !task.startTime || !task.endTime || dayjs(task.endTime).diff(dayjs(task.startTime), 'hour') >= 23 , // Check if it spans roughly a full day
            resource: task, // Lưu trữ task gốc nếu cần truy cập khi click
            statusColor: task.status?.color || '#1890ff' // Ví dụ màu dựa trên status
        }));

     // --- Custom cell render cho Antd Calendar ---
     const dateCellRender = (value) => {
        const dateStr = value.format('YYYY-MM-DD');
        const listData = events.filter(event => {
            const startStr = dayjs(event.start).format('YYYY-MM-DD');
            // Chỉ hiển thị nếu task bắt đầu vào ngày này (hoặc logic khác nếu muốn hiển thị task kéo dài)
            return startStr === dateStr;
        });
        return (
            <ul className="events" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {listData.map(item => (
                    <li key={item.id} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         {/* Sử dụng màu từ event hoặc màu mặc định */}
                        <Badge status="processing" color={item.statusColor || '#1890ff'} text={item.title} />
                    </li>
                ))}
            </ul>
        );
    };

     const handleSelectDate = (date) => {
        console.log("Selected date:", date.format('YYYY-MM-DD'));
        // Có thể filter hoặc làm gì đó khi chọn ngày
    };

     const handlePanelChange = (date, mode) => {
        console.log("Panel change:", date.format('YYYY-MM-DD'), mode);
    };


    return (
        <div>
            <Title level={4} style={{ marginBottom: '1rem' }}>Project Calendar</Title>
            <div style={{ height: '600px', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px' }}>
                {/* --- Sử dụng react-big-calendar --- */}
                {/*
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={event => console.log("Selected Task:", event.resource)} // Mở modal detail task
                />
                 */}

                {/* --- Hoặc sử dụng Antd Calendar --- */}
                 <AntdCalendar
                    dateCellRender={dateCellRender}
                    onSelect={handleSelectDate}
                    onPanelChange={handlePanelChange}
                 />
            </div>
        </div>
    );
};

export default TaskCalendarTab;