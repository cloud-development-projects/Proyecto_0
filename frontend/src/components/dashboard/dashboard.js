// components/Dashboard/Dashboard.js
import React, { useState } from 'react';
import Header from './header';
import FilterSidebar from './filterSidebar';
import TaskList from './taskList';
import AddTaskModal from './addTaskModal';

const Dashboard = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Header onAddTask={() => setShowAddTask(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FilterSidebar
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setSelectedStatus}
          />

          <TaskList
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
          />
        </div>

        {showAddTask && (
          <AddTaskModal
            onClose={() => setShowAddTask(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;