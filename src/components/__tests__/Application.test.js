import React from "react";
import axios from "axios";

import {
  render,
  cleanup,
  fireEvent,
  findByText,
  queryAllByTestId,
  getAllByTestId,
  getByPlaceholderText,
  getByAltText,
  getByText,
  queryByText,
  queryByAltText,
  findByAltText,
} from "@testing-library/react";

import Application from "components/Application";

afterEach(cleanup);

describe("application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", async () => {
    const { queryByText, getByText, findByText } = render(<Application />);

    await findByText("Monday");

    fireEvent.click(getByText("Tuesday"));
    expect(queryByText("Leopold Silvers")).toBeInTheDocument();
  });

  it("loads data, books an interview and reduces the spots remaining for the first day by 1", async () => {
    const { container } = render(<Application />);
    await findByText(container, "Archie Cohen");

    const appointments = queryAllByTestId(container, "appointment");
    const appointment = getAllByTestId(container, "appointment")[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });

    fireEvent.click(getByAltText(container, "Sylvia Palmer"));

    fireEvent.click(getByText(container, "Save"));

    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await findByText(appointment, "Lydia Miller-Jones");

    expect(getByAltText(appointment, "Edit")).toBeInTheDocument();
    expect(getByAltText(appointment, "Delete")).toBeInTheDocument();

    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "no spots remaining"));
  });

  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    const { container } = render(<Application />);
    await findByText(container, "Archie Cohen");

    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Delete"));

    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    fireEvent.click(getByText(appointment, "Confirm"));

    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    await findByAltText(appointment, "Add");

    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "2 spots remaining"));
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    const { container } = render(<Application />);
    await findByText(container, "Archie Cohen");

    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Edit"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });

    fireEvent.click(getByAltText(container, "Sylvia Palmer"));

    fireEvent.click(getByText(container, "Save"));

    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await findByText(appointment, "Lydia Miller-Jones");

    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "1 spot remaining"));
  });

  it("shows the save error when failing to save an appointment", async () => {
    axios.put.mockRejectedValueOnce();
    const { container } = render(<Application />);
    await findByText(container, "Archie Cohen");

    const appointments = queryAllByTestId(container, "appointment");
    const appointment = getAllByTestId(container, "appointment")[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });

    fireEvent.click(getByAltText(container, "Sylvia Palmer"));

    fireEvent.click(getByText(container, "Save"));

    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await findByText(appointment, "Error");

    expect(
      getByText(appointment, "Could not book appointment.")
    ).toBeInTheDocument();
  });

  it("shows the delete error when failing to delete an existing appointment", async () => {
    axios.delete.mockRejectedValueOnce();

    const { container } = render(<Application />);
    await findByText(container, "Archie Cohen");

    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Delete"));

    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    fireEvent.click(getByText(appointment, "Confirm"));

    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    await findByText(appointment, "Error");

    expect(
      getByText(appointment, "Could not cancel appointment.")
    ).toBeInTheDocument();
  });
});
