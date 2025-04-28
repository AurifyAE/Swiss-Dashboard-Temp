import React from "react";
import Header from "../components/Header";
import CategorySpotrate from "../components/userSession/CategorySpotrate";

function CategorySpotratePage() {
  const title = "Category Spotrate";
  const description = "Customise the price rate for this particular category";
  return (
    <div className="bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full">
      <Header title={title} description={description} />
      <CategorySpotrate />
    </div>
  );
}

export default CategorySpotratePage;
