// src/pages/Inquiry.jsx
function Inquiry() {
  return (
    <>

      {/* Blurred Background Container */}
      <div className="bg-container min-h-screen flex items-center justify-center py-10">
        <div className="bg-blur-content max-w-2xl w-full p-8 rounded-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Send Us an Inquiry</h2>

          {/* Inquiry Form */}
          <form action="#" method="POST" className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <textarea
                name="message"
                rows="4"
                placeholder="Your Message"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              Send Inquiry
            </button>
          </form>
        </div>
      </div>

    </>
  );
}

export default Inquiry;
