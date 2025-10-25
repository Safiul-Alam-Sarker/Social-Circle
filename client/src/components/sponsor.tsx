import AdImage from "../assets/sponsored_img.png";
const Sponsor = () => {
  return (
    <>
      <div className="hidden lg:block bg-white rounded-xl p-5 shadow-2xl">
        <h1 className="font-bold text-xl py-2">Sponsored</h1>
        <div className="text-black/60 flex flex-col justify-center ">
          <img
            src={AdImage}
            alt="adImage"
            className="h-[200px] w-full rounded-xl"
          />
          <h2 className="text-black/80 py-2">Email marketing</h2>
          <p className="text-black/60 py-2">
            Supercharge your marketing with a powerful, easy- to-use platform
            built for results.
          </p>
        </div>
      </div>
    </>
  );
};

export default Sponsor;
