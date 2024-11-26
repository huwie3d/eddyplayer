export const FancyBox = ({
  children,
  showLyrics,
  isFullPage,
}: {
  children: React.ReactNode;
  showLyrics: boolean;
  isFullPage: boolean;
}) => {
  if (!isFullPage) {
    return (
      <div className="w-screen h-screen min-w-full -mx-4 p-8">
        <div className="bg-black/30 frosted-glass rounded-3xl shadow-2xl min-h-full flex relative transition-all duration-300">
          <div className="grid grid-cols-1 grid-rows-6 md:grid-cols-6 md:grid-rows-1 justify-center place-content-center content-center max-h-full w-full">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`md:w-full ${
        showLyrics
          ? "md:max-w-6xl p-6 h-[90vh] md:h-auto mt-10 sm:mx-8 md:mt-0"
          : "md:max-w-3xl p-8"
      } bg-black/30 frosted-glass rounded-3xl shadow-2xl relative transition-all duration-300`}
    >
      <div
        className={`flex flex-col-reverse md:flex-row min-w-full gap-4 my-2`}
      >
        {children}
      </div>
    </div>
  );
};
