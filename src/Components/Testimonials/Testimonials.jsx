import React from "react";

const Testimonials = () => {
  return (
    <section className="my-10 text-center">
      <h2 className="text-2xl font-bold">Success <span className="text-pink-500">Stories</span></h2>
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        <div className="bg-pink-200 p-4 rounded-lg shadow-md max-w-xs text-center">
          <p className="font-bold">John Doe</p>
          <p>"This platform helped me secure my dream job!"</p>
        </div>
        <div className="bg-pink-200 p-4 rounded-lg shadow-md max-w-xs text-center">
          <p className="font-bold">Alice Smith</p>
          <p>"I got hired in a top company through this portal!"</p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;