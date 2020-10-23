import React from "react";
import Adapter from "enzyme-adapter-react-16";
import { configure, shallow } from "enzyme";
import "jest-enzyme";
import branch1 from "../public/api/branch1.json";
import branch2 from "../public/api/branch2.json";
import branch3 from "../public/api/branch3.json";
import App from "./App";

configure({
    adapter: new Adapter()
});

const responses = {
    "api/branch1.json": branch1,
    "api/branch2.json": branch2,
    "api/branch3.json": branch3,
    "/api/branch1.json": branch1,
    "/api/branch2.json": branch2,
    "/api/branch3.json": branch3
};

global.fetch = endpoint =>
    Promise.resolve({
        json: () => Promise.resolve(responses[endpoint])
    });

const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

export const flushRequestsAndUpdate = async enzymeWrapper => {
    await flushAllPromises();
    enzymeWrapper.update();
};

it("renders without crashing", () => {
    shallow(<App />);
});

it("renders loading text initially", async () => {
    const app = shallow(<App />);
    expect(app).toHaveText("Loading...");
});

it("renders a table after data load", async () => {
    const app = shallow(<App />);
    expect(app).toHaveText("Loading...");
    await flushRequestsAndUpdate(app);
    expect(app.find("table")).toExist();
});

it("renders rows with country name as key", async () => {
    const app = shallow(<App />);
    await flushRequestsAndUpdate(app);

    expect(
        app
            .find("table tbody tr")
            .at(56)
            .key()
    ).toEqual("Hominy");
    expect(
        app
            .find("table tbody tr")
            .at(73)
            .key()
    ).toEqual("Lychee");
});

it("renders table that is sorted ascending", async () => {
    const app = shallow(<App />);
    await flushRequestsAndUpdate(app);
    expect(app.find("table")).toMatchSnapshot();
});

it("calculates total revenue of all branches", async () => {
    const app = shallow(<App />);
    await flushRequestsAndUpdate(app);
    expect(app.find("tfoot td:last-child").text()).toEqual("2,102,619.44");
});

it("filters the displayed products", async () => {
    const app = shallow(<App />);
    await flushRequestsAndUpdate(app);
    const changeEvent = { target: { value: "pear" } };
    app.find("input").simulate("change", changeEvent);
    expect(app.find("tfoot td:last-child").text()).toEqual("60,681.02");
});