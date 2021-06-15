import "./styles.css";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";

const TableHeader = styled.th`
  background: #6f6f6f;
  padding: 0.5em 0.8em;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 0.8em;
  position: relative;
`;
const TableRow = styled.tr`
  font-size: 0.8em;
`;
const TableData = styled.td`
  border-bottom: 0.02em solid black;
  padding: 0.5em;
  color: #dbd1d0;
  &.rp {
    background: #252f38;
  }
  &.ri {
    background: #151e23;
  }
`;

const Table = styled.table`
  text-align: center;
  width: 100%;
`;

const InputElement = styled.input`
  padding: 0.5em;
  color: black;
  margin: 1em;
`;

const SVGIconButton = styled.svg`
  width: 1em;
  position: absolute;
  right: -0.2em;
  top: 0.5em;
  height: 1em;
  fill: black;
`;

// https://randomuser.me/api/?results=20

function SearchInput(props) {
  const [input, setInput] = useState("");
  useEffect(() => {
    props.updateSearchData(input);
  }, [input]);
  return (
    <InputElement
      placeholder="Search"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  );
}

function getRandomUser() {
  return axios
    .get("https://randomuser.me/api/?results=100")
    .then((e) => {
      return e.data.results;
    })
    .catch((err) => console.log(err));
}

function flattenLocations(locations: any[]) {
  const data = locations.map(({ street, coordinates, timezone, ...rest }) => {
    return {
      ...rest,
      number: street.number,
      name: street.name,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    };
  });
  const flattenKeys = getObjectKeys(data[0]);
  return {
    headers: flattenKeys,
    data
  };
}

function getObjectKeys(data: any) {
  var listKeys = [];

  Object.keys(data).forEach((key) => {
    if (typeof data[key] !== "object") {
      listKeys.push(key);
    } else {
      listKeys = [...listKeys, ...getObjectKeys(data[key])];
    }
  });
  return listKeys;
}

function sortColumnRule(column, ruleColumn) {
  switch (ruleColumn.direction) {
    case "ASCENDING":
      return {
        column: column,
        direction: "DESCENDING"
      };
    case "DESCENDING":
      return {
        column: column,
        direction: "ASCENDING"
      };
    default:
      return {
        column: column,
        direction: "DESCENDING"
      };
  }
}

function SvgIconSortAscending() {
  return (
    <SVGIconButton xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
      <path
        fill-rule="evenodd"
        d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
      />
    </SVGIconButton>
  );
}

function SvgIconSortDescending() {
  return (
    <SVGIconButton xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
      <path
        fill-rule="evenodd"
        d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
      />
    </SVGIconButton>
  );
}

export default function App() {
  const [dataTable, setDataTable] = useState(null);
  const [dataSearch, setDataSearch] = useState(null);
  const [sortingDirections, setSortingDirections] = useState({}); //rules

  const updateSearchData = (value) => {
    if (dataTable === null) return;
    const newDataSearch = dataTable.data.filter((item) => {
      return Object.values(item).some(
        (el) => String(el).toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    });
    setDataSearch({ headers: dataTable.headers, data: newDataSearch });
  };
  useEffect(() => {
    getRandomUser().then((dataSet) => {
      var dataToBeStored = flattenLocations(
        dataSet.map(({ location }) => location)
      );
      setDataTable(dataToBeStored);
      setDataSearch(dataToBeStored);
    });
  }, []);

  function compareMiddleware(rule) {
    return function compare(a, b) {
      var column = rule.column;
      if (rule.direction === "ASCENDING") {
        if (a[column] < b[column]) return -1;
        if (a[column] > b[column]) return 1;
      } else {
        if (a[column] > b[column]) return -1;
        if (a[column] < b[column]) return 1;
      }
      return 0;
    };
  }
  function sortColumn(column) {
    //{column : "column",direction}
    const newData = JSON.parse(JSON.stringify(dataSearch));
    if (!sortingDirections.hasOwnProperty("column")) {
      var newRule = {
        column: column,
        direction: "ASCENDING"
      };
      setSortingDirections(newRule);
      newData.data = newData.data.sort(compareMiddleware(newRule));
    } else {
      const newRule = sortColumnRule(column, sortingDirections);
      setSortingDirections(newRule);
      newData.data = newData.data.sort(compareMiddleware(newRule));
    }

    setDataSearch(newData);
  }

  return (
    <div className="App">
      <SearchInput updateSearchData={updateSearchData} />
      {dataSearch && dataSearch.data && (
        <Table border="0" cellSpacing="0" cellPadding="0">
          <thead>
            <tr>
              {dataSearch &&
                dataSearch.headers.map((headerItem, index) => (
                  <TableHeader
                    key={index}
                    onClick={() => sortColumn(headerItem)}
                  >
                    {headerItem}
                    {sortingDirections && sortingDirections.column && (
                      <span>
                        {sortingDirections.column === headerItem &&
                          sortingDirections.direction === "ASCENDING" && (
                            <SvgIconSortAscending />
                          )}
                        {sortingDirections.column === headerItem &&
                          sortingDirections.direction === "DESCENDING" && (
                            <SvgIconSortDescending />
                          )}
                      </span>
                    )}
                  </TableHeader>
                ))}
            </tr>
          </thead>
          <tbody>
            {dataSearch &&
              dataSearch.data.map((item, index2) => (
                <TableRow key={index2}>
                  {dataSearch.headers.map((headerItem, index) => (
                    <TableData
                      className={`${index2 % 2 == 0 ? "rp" : "ri"} ${
                        index % 2 == 0 ? "cp" : "ci"
                      }`}
                      key={index}
                    >
                      {item[headerItem]}
                    </TableData>
                  ))}
                </TableRow>
              ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
