import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Spinner, Alert, Dropdown } from 'react-bootstrap';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import eventService from '../services/eventService';
import EventDialog from './EventDialog';

const localizer = momentLocalizer(moment);

const eventTypeLabels = {
  payment: 'Thanh toán',
  maintenance: 'Bảo trì',
  visit: 'Xem phòng',
  community: 'Cộng đồng',
  other: 'Khác'
};

const eventColors = {
  payment: '#1976d2',
  maintenance: '#ff9800',
  visit: '#43a047',
  community: '#8e24aa',
  other: '#757575'
};

const EventCalendar = ({ accommodationId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate(),
  });

  const fetchEvents = useCallback(() => {
    setLoading(true);
    setError('');

    const params = {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    };

    if (accommodationId) {
      params.accommodationId = accommodationId;
    }

    eventService.getEvents(params)
      .then(data => setEvents(data.map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
        title: e.title
      }))))
      .catch(() => setError('Lỗi khi lấy sự kiện'))
      .finally(() => setLoading(false));
  }, [dateRange, accommodationId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent({ start, end });
    setShowDialog(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDialog(true);
  };

  const handleDelete = async (event) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;
    await eventService.deleteEvent(event.id);
    fetchEvents();
    setShowDialog(false);
  };

  const handleNavigate = (date) => {
    setDateRange({
      start: moment(date).startOf('month').toDate(),
      end: moment(date).endOf('month').toDate(),
    });
  };

  const handleView = (view) => {
    setDateRange({
        start: moment().startOf(view).toDate(),
        end: moment().endOf(view).toDate(),
    });
  };

  const filteredEvents = filterType === 'all' ? events : events.filter(e => e.type === filterType);

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <b>Lịch sự kiện</b>
        <Dropdown onSelect={setFilterType}>
          <Dropdown.Toggle variant="outline-secondary" size="sm">
            {filterType === 'all' ? 'Tất cả loại' : eventTypeLabels[filterType]}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="all">Tất cả loại</Dropdown.Item>
            {Object.entries(eventTypeLabels).map(([k, v]) => (
              <Dropdown.Item key={k} eventKey={k}>{v}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? <Spinner animation="border" /> : (
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            onView={handleView}
            eventPropGetter={event => ({ style: { backgroundColor: eventColors[event.type] || '#757575', color: 'white' } })}
            messages={{
              today: 'Hôm nay',
              previous: 'Trước',
              next: 'Tiếp',
              month: 'Tháng',
              week: 'Tuần',
              day: 'Ngày',
              agenda: 'Danh sách'
            }}
          />
        )}
        <EventDialog
          show={showDialog}
          onHide={() => { setShowDialog(false); setSelectedEvent(null); }}
          event={selectedEvent && selectedEvent.id ? selectedEvent : null}
          onSave={fetchEvents}
        />
        {selectedEvent && selectedEvent.id && (
          <div className="mt-2 text-end">
            <Button variant="danger" size="sm" onClick={() => handleDelete(selectedEvent)}>Xóa sự kiện</Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default EventCalendar; 