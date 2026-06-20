import React from "react";

const page = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* ✅ Top Banner Image */}

      {/* ✅ Top Ticker Bar */}
      <div className="w-full rounded-md overflow-hidden shadow-md">
        <iframe
          src="https://fxpricing.com/fx-widget/ticker-tape-widget.php?id=1,2,3,5,14,20&border=show&speed=50&click_target=blank&theme=dark&tm-cr=212529&hr-cr=FFFFFF13&by-cr=28A745&sl-cr=DC3545&flags=circle&d_mode=compact-name&column=ask,bid,spread&lang=en&font=Arial, sans-serif"
          width="100%"
          height="85"
          style={{ border: "unset" }}
        ></iframe>
      </div>
    </div>
  );
};

export default page;
