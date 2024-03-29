import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import useSearch from "../../hooks/useSearch";
import Table from "../../components/Table/Table";
import { complaintsPageGrid } from "../../data/pagesGrid";

const Complaints = () => {
  const [complaintsList, setComplaintsList] = useState([]);
  const {
    data: complaints,
    loading: complaintsLoading,
    error: complaintsHasError,
  } = useAxios(
    `http://127.0.0.1:5000/api/v1/complaints`,
    "GET"
  );

  const [sortBy, setSortBy] = useState("id");
  const { setOriginalArray, filterArray, filteredArray, inputValue } =
    useSearch("title");
  const [resultAfterFiler, setResultAfterFiler] = useState(filteredArray);
  const [activeFilter, setActiveFilter] = useState();

  useEffect(() => {
    if (complaints) {
      const newData = complaints.map((element) => ({
        id: element._id,
        title: element.title,
        category: element.category,
        user: element.user,
        date_created: element.date_created,
        status: element.status,
      }));

      setComplaintsList(newData);
      setOriginalArray(newData);
    }
  }, [setOriginalArray, complaints]);

  useEffect(() => {
    setResultAfterFiler(filteredArray);
  }, [filteredArray]);

  const searchHandler = (value) => {
    filterArray(value);
    setActiveFilter(null);
  };

  const sortHandler = (value) => {
    setSortBy(value);
  };

  const filterHandler = (property, value) => {
    setResultAfterFiler(
      filteredArray.filter((element) => element[property] === value)
    );
    setActiveFilter(value);
  };

  const badges = [
    { label: "Pending", attr: "status", value: 1 },
    { label: "Closed", attr: "status", value: 0 },
  ];

  return (
    <Table
      title="Complaints"
      searchInputValue={inputValue}
      searchHandler={searchHandler}
      elementsPerPage={10}
      pagination={true}
      sortBy={sortBy}
      sortHandler={sortHandler}
      filterHandler={filterHandler}
      filteredArray={resultAfterFiler}
      badges={badges}
      activeFilter={activeFilter}
      search={true}
      isLoading={complaintsLoading}
      error={complaintsHasError}
      elements={complaintsList}
      linkTo="/admin/complaint/"
      table={complaintsPageGrid}
    />
  );
};

export default Complaints;
