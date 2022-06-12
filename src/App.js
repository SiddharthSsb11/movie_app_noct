import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { Button, Input, Table, Tag, message, DatePicker } from "antd";
import axios from "axios";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const { Search } = Input;
const { RangePicker } = DatePicker;

const dateFormat = "DD/MM/YYYY";

function App() {
  const [loading, setLoading] = useState(false);
  const [movieSearchName, setMovieSearchName] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  //const [movieData, setMovieData] = useState({});
  const [totalSearchResults, setTotalSearchResults] = useState();
  const [movieData, setMovieData] = useState([]);

  const [dates, setDates] = useState(null);
  const [hackValue, setHackValue] = useState(null);
  const [value, setValue] = useState(null);

  const [page, setPage] = useState(1);
  //const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      title: "Title",
      dataIndex: "Title",
      key: "Title",
      render: (titleName) => <b>{titleName}</b>,
      sorter: (a, b) => a.Title.localeCompare(b.Title),
    },
    {
      title: "Released",
      dataIndex: "Released",
      key: "Released",
      sorter: (a, b) => {
        return moment(a.Released).unix() - moment(b.Released).unix();
      },
    },
    {
      title: "Director",
      dataIndex: "Director",
      key: "Director",
    },
    {
      title: "Genre",
      key: "Genre",
      dataIndex: "Genre",
      render: (genre) => (
        <React.Fragment>
          {genre.split(",").map((genre) => {
            let color = genre.length > 6 ? "#0000FF" : "#00FF00";

            return (
              <Tag color={color} key={uuidv4()}>
                {genre.toUpperCase()}
              </Tag>
            );
          })}
        </React.Fragment>
      ),
    },
    {
      title: "Rating",
      dataIndex: "imdbRating",
      key: "imdbRating",
      render: (rating) => {
        return <b>{rating * 10}%</b>;
      },
      sorter: (a, b) => {
        //return a.Ratings[1].value - b.Ratings[1].value;
        return a.imdbRating - b.imdbRating;
      },
    },
  ];

  const onOpenChange = (open) => {
    if (open) {
      setHackValue([null, null]);
      setDates([null, null]);
    } else {
      setHackValue(null);
    }
  };

  const searchHandler = async (movieValue) => {
    try {
      if (movieValue) {
        setMovieSearchName(movieValue);
        setLoading(true);
        const data = await axios.get(
          `https://www.omdbapi.com/?type=movie&s=${movieValue}&apikey=a73d03cd`
        );

        //console.log(data.data);
        if (data.data.Search.length === 0) {
          throw new Error();
        }
        setSearchResults(data.data.Search);
        setTotalSearchResults(data.data.totalResults);

        setLoading(false);
        message.success("Movies Loaded 🍿");
      } else {
        message.warning("Try searching Goodfellas 💥");
      }
    } catch (err) {
      //console.log(err);
      setLoading(false);
      message.error("OOPS !! Try to be more specific 🔃");
    }
  };

  const fetchMovieDetails = () => {
    setMovieData([]);
    searchResults?.forEach(async (result) => {
      try {
        setLoading(true);
        let data = await axios.get(
          `https://www.omdbapi.com/?i=${result.imdbID}&apikey=a73d03cd`
        );
        //console.log(data.data);
        setMovieData((prevData) => [data.data, ...prevData]);
        //console.log(movieData)
        //setMovieData(data.data)
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
        message.error("OOPS !! Something Went Wrong 🔃");
        //window.location.reload();
      }
    });
  };

  useEffect(() => {
    fetchMovieDetails();
    // eslint-disable-next-line
  }, [searchResults]);

  const dateRangeHandler = () => {
    const filteredMovieData = movieData.filter((data) => {
      if (
        moment(data.Released).unix() > moment(dates[0]._d).unix() &&
        moment(data.Released).unix() < moment(dates[1]._d).unix()
      ) {
        return data;
      } else {
        return null;
      }
    });
    setMovieData(filteredMovieData);
  };

  const dateResetHandler = () => {
    setDates(null);
    setValue(null);
    fetchMovieDetails();
  };

  const paginationHandler = async(page, /* pageSize */) => {
    try {
      if (movieSearchName) {
        setLoading(true);
        const data = await axios.get(
          `https://www.omdbapi.com/?type=movie&s=${movieSearchName}&page=${page}&apikey=a73d03cd`
        );

        //console.log(data.data);
        if (data.data.Search.length === 0) {
          throw new Error();
        }
        setSearchResults(data.data.Search);
        //setTotalSearchResults(data.data.totalResults);

        setLoading(false);
      } else {
        message.warning("Try searching Goodfellas 💥");
      }
    } catch (err) {
      //console.log(err);
      setLoading(false);
      message.error("OOPS !! Try again 🔃");
    }

    setPage(page);
    //setPageSize(pageSize);
    console.log(page)

  };

  return (
    <div className="App">
      <h1 style={{ color: "white" }}>Movie &nbsp;Search &nbsp;App</h1>
      <Search
        style={{ width: "50%" }}
        placeholder="Try typing batman..."
        allowClear
        enterButton
        //enterButton="Search"
        size="large"
        onSearch={searchHandler}
      />

      <div className="date">
        <RangePicker
          defaultValue={[
            moment("01/01/2015", dateFormat),
            moment("01/01/2015", dateFormat),
          ]}
          format={dateFormat}
          value={hackValue || value}
          onCalendarChange={(val) => setDates(val)}
          onChange={(val) => setValue(val)}
          onOpenChange={onOpenChange}
        />
        <Button type="primary" disabled={!dates} onClick={dateRangeHandler}>
          {" "}
          Apply Date Range Filter{" "}
        </Button>
        <Button type="primary" disabled={!dates} onClick={dateResetHandler}>
          Reset
        </Button>
      </div>

      <Table
        key={uuidv4()}
        style={{ width: "75%" }}
        bordered
        loading={loading}
        columns={columns}
        dataSource={movieData}
        pagination={{
          defaultCurrent: 1,
          current: page,
          //pageSize: pageSize,
          pageSize: 10,
          total: Math.round(totalSearchResults/10),
          onChange: (page) => {
            paginationHandler(page);
          },
        }}
      />
    </div>
  );
}

export default App;
