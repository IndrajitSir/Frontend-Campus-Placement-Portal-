// Constants
export const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#a4de6c"];
export const record = [
    { _id: 1, user_id: { name: "John Doe" }, placement_id: { company_name: "Google", job_title: "Software Engineer" } },
    { _id: 2, user_id: { name: "John Doe" }, placement_id: { company_name: "Google", job_title: "Software Engineer" } },
];
export const testimonials = [
    {
        name: "John Doe",
        text: "This platform helped me secure my dream job!",
        img: "img_1.png"
    },
    {
        name: "Jane Smith",
        text: "Super easy to apply for jobs and track my applications.",
        img: "img_2.png"
    }
];

export const animation = {
    x: ["0vw", "30vw", "20vw", "34vw", "10vw", "20vw"], // Moves left and right
    y: ["0vh", "20vh", "-30vh", "-40vh", "10vh", "23vh"],  // Moves up and down
    transition: {
        duration: 58,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
    },
};