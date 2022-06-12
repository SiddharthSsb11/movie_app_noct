import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { Button, Input, Table, Tag, message, spin } from "antd";
import axios from "axios";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const { Search } = Input;

function App() {
  const [loading, setLoading] = useState(false);
  const [movieSearchName, setMovieSearchName] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  //const [movieData, setMovieData] = useState({});
  const [totalSearchResults, setTotalSearchResults] = useState();
  const [movieData, setMovieData] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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
      title: "Rotten Tomatoes Rating",
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

  const searchHandler = async (value) => {
    try {
      
      if (value) {
        
        setMovieSearchName(value);
        setLoading(true);
        const data = await axios.get(
          `https://www.omdbapi.com/?type=movie&s=${value}&apikey=19f2b90b`
        );

        //console.log(data.data);
        if(data.data.Search.length===0){
          throw new Error
        }
        setSearchResults(data.data.Search);
        setTotalSearchResults(data.data.totalResults);

        setLoading(false);
        message.success("Movies Loaded 🍿");
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
          `https://www.omdbapi.com/?i=${result.imdbID}&apikey=19f2b90b`
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

    //fetchMovieDetails();
    // eslint-disable-next-line
  }, [searchResults]);

  //console.log(movieData);
 // console.log(searchResults);
  //console.log(totalSearchResults);

  const paginationHandler = (page, pageSize) => {
    setLoading(true);
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
      {/* Date range picker */}

      <Table
        key ={uuidv4()}
        style={{ width: "75%" }}
        bordered
        loading={loading}
        columns={columns}
        dataSource={movieData}
        pagination={{
          defaultCurrent: 1,
          current: page,
          pageSize: pageSize,
          total: totalSearchResults,
          onChange: (page, pageSize) => {
            paginationHandler(page, pageSize);
          },
        }}
      />
    </div>
  );
}

export default App;
