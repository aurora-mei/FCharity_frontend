module.exports = {
    include: [
        'node_modules',
    ],
    plugins: [
        require('autoprefixer'), // Đúng cú pháp
        require('postcss-nesting') // Không có dấu ","
    ]
};
