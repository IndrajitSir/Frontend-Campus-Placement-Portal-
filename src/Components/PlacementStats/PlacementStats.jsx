import React from "react";
// import { motion } from "framer-motion";

// const stats = [
//   { title: "98% Placement Rate", value: "98%" },
//   { title: "300+ Recruiters", value: "300+" },
//   { title: "1000+ Successful Hires", value: "1000+" }
// ];
const PlacementStats = () => {// NOT USED
    return (
      <section className="text-center my-10">
      <h1 className="text-4xl font-bold">Placement <span className="text-pink-500">Statistics</span></h1>
      <div className="flex justify-center gap-6 mt-6">
        <div className="bg-pink-200 p-6 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-md">
          <p className="text-lg font-bold">100%</p>
          <p>Placement</p>
        </div>
        <div className="bg-pink-200 p-6 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-md">
          <p className="text-lg font-bold">98%</p>
          <p>Success</p>
        </div>
        <div className="bg-pink-200 p-6 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-md">
          <p className="text-lg font-bold">300+</p>
          <p>Offers</p>
        </div>
      </div>
    </section>
    );
  };

  export default PlacementStats;

