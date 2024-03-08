import React, { Component } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from 'axios'; // Import axios for HTTP requests
const localizer = momentLocalizer(moment); // Create localizer using Moment.js

class SchedulePage extends Component {  
  constructor(props) {
    super(props);

    this.state = {
      events: [
        
      ] // Initialize events state as empty array
    };
  }

  componentDidMount() {
    // Fetch events data from the database
    axios.get('/api/events')
      .then(response => {
        this.setState({ events: response.data }); // Update events state with data from database
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }

  handleSelect = ({ start, end }) => {
    const title = window.prompt('New Event name'); // Prompt user for new event name
    if (title) {
      this.setState({
        events: [
          ...this.state.events,
          {
            start,
            end,
            title,
          },
        ],
      })
      // Create new event object
      const newEvent = {
        start,
        end,
        title
      };

      // Send new event data to the server to be saved in the database
      axios.post('/api/events', JSON.stringify(newEvent),{
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          // Update events state with new event data from the server
          this.setState(prevState => ({
            events: [...prevState.events, response.data]
          }));
        })
        .catch(error => {
          console.error('Error saving event:', error);
        });
    }
  }

  render() {
    return (
      <div className="App">
        <Calendar
          selectable
          onSelectSlot={this.handleSelect}
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          events={this.state.events}
          style={{ height: "100vh" }}
        />
      </div>
    );
  }
}

export default SchedulePage;
