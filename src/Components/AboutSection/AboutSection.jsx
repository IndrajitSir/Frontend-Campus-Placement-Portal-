import { motion } from "framer-motion";
import styled from "styled-components";

const AboutSection = () => {
    return (
        <>
            <section className="bg-gradient-to-b from-purple-50 to-purple-100 py-20 px-6 md:px-16 lg:px-32">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl font-bold text-gray-900 mb-6"
                    >
                        About Our Placement Portal
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto"
                    >
                        Our placement portal bridges the gap between students and top companies.
                        It offers a streamlined recruitment process, ensuring better opportunities
                        for students while simplifying hiring for recruiters. With real-time updates,
                        easy applications, and industry insights, our platform ensures transparency
                        and efficiency in the placement journey.
                    </motion.p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="p-6 bg-white shadow-lg rounded-lg"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Why Choose Us?</h3>
                        <p className="text-gray-700">
                            We provide an intuitive platform, simplifying job applications
                            and ensuring secure, efficient placement management.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="p-6 bg-white shadow-lg rounded-lg"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
                        <p className="text-gray-700">
                            A dynamic dashboard, automated notifications, and AI-driven job
                            recommendations for seamless hiring experiences.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="p-6 bg-white shadow-lg rounded-lg"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">For Institutions</h3>
                        <p className="text-gray-700">
                            Colleges can monitor student applications, manage recruitment drives,
                            and track placement records efficiently.
                        </p>
                    </motion.div>
                </div>
            </section>
            <section className="py-16 px-6 bg-white text-black">
                {/* <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-black">
          Some more <span className="text-pink-500">Key Details</span>
        </h2>
      </div> */}

                <div className="flex flex-col items-center gap-12 md:flex-row md:flex-wrap md:justify-center">
                    {/* Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full md:w-1/3 bg-pink-300 rounded-full p-10 text-center shadow-lg">
                        <p className="text-lg font-semibold">
                            Our placement portal ensures smooth hiring process, providing students with valid opportunities.
                        </p>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full md:w-1/3 bg-pink-300 rounded-full p-10 text-center shadow-lg">
                        <p className="text-lg font-semibold">
                            The system makes an employer-student connection via documentation, helping institutions get sophisticated insights.
                        </p>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="w-full md:w-1/3 bg-pink-300 rounded-full p-10 text-center shadow-lg">
                        <p className="text-lg font-semibold">
                            The developed system works efficiently for placement needs and tracking statistics.
                        </p>
                    </motion.div>

                    {/* Card 4 */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/3 bg-pink-300 rounded-full p-10 text-center shadow-lg">
                        <p className="text-lg font-semibold">
                            Institutions and recruiters get a streamlined hiring and selection experience with verified applicants.
                        </p>
                    </motion.div>

                    {/* Card 5 */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9 }}
                        className="w-full md:w-1/3 bg-pink-300 rounded-full p-10 text-center shadow-lg">
                        <p className="text-lg font-semibold">
                            Our platform helps students enhance resumes, stay updated, and apply for the best placements.
                        </p>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default AboutSection;

const Container = styled.div`
    min-height: 80vh;
    background: linear-gradient(135deg, #121212, #1e1e1e);
    color: white;
    padding: 50px 20px;
    text-align: center;
    border-radius: 10px;
    margin-top: 8vw;
    h2{
    font-size: 2rem;
    }
`;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 40px;
`;

const QuestionBox = styled(motion.div)`
    background: ${(props) => props.color};
    backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 15px;
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);

    &:hover {
        transform: scale(1.05);
        box-shadow: 0px 6px 15px rgba(255, 255, 255, 0.2);
    }

    h3 {
        font-size: 1.5rem;
        font-weight: bold;
        text-decoration: underline;
    }

    p {
        font-size: 1.2rem;
        margin-top: 10px;
    }
`;