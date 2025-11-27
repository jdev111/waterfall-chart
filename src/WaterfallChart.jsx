import React, { useState, useEffect, useRef } from 'react';
import './WaterfallChart.css';

// Flexoki-inspired color palette for wellness brand
const colors = {
  background: "#fffcf0",
  paper: "#f2f0e5",
  border: "#cecdc3",
  text: "#100f0f",
  textMuted: "#6f6e69",
  red: "#D14D41",       // Updated for exposures
  green: "#879A39",     // Updated for interventions
  neutral: "#878580",   // Updated for subtotal bars
  purple: "#8b7ec8",    // For levels
  accent: "#d0a215"     // For buttons/highlights
};

// Predefined exposure types with units and reference levels
const exposurePresets = [
  {
    name: "ELF Magnetic Fields",
    units: "mG-h",
    levels: [
      { name: 'Optimal', value: 0, color: '#87d3c3', enabled: true },
      { name: 'Good', value: 4.8, color: '#879A39', enabled: true },
      { name: 'Moderate', value: 24, color: '#D0A215', enabled: true },
      { name: 'Unhealthy for Sensitive Groups', value: 48, color: '#DA702C', enabled: true },
      { name: 'Unhealthy', value: 240, color: '#D14D41', enabled: true },
      { name: 'Very Unhealthy', value: 1200, color: '#a02f6f', enabled: true },
    ]
  },
  {
    name: "Radiofrequency Radiation",
    units: "µW-h/m²",
    levels: [
      { name: 'Optimal', value: 0, color: '#87d3c3', enabled: true },
      { name: 'Good', value: 720, color: '#879A39', enabled: true },
      { name: 'Moderate', value: 12000, color: '#D0A215', enabled: true },
      { name: 'Unhealthy for Sensitive Groups', value: 60000, color: '#DA702C', enabled: true },
      { name: 'Unhealthy', value: 240000, color: '#D14D41', enabled: true },
      { name: 'Very Unhealthy', value: 1200000, color: '#a02f6f', enabled: true },
    ]
  },
{
    name: "AC Electrical Fields",
    units: "V-h",
    levels: [
      { name: 'Optimal', value: 0, color: '#87d3c3', enabled: true },
      { name: 'Good', value: 0.48, color: '#879A39', enabled: true },
      { name: 'Moderate', value: 4.8, color: '#D0A215', enabled: true },
      { name: 'Unhealthy for Sensitive Groups', value: 9.6, color: '#DA702C', enabled: true },
      { name: 'Unhealthy', value: 24.0, color: '#D14D41', enabled: true },
      { name: 'Very Unhealthy', value: 48.0, color: '#a02f6f', enabled: true },
    ]
  },
  {
    name: "Custom",
    units: "",
    levels: []
  }
];

const WaterfallChart = () => {
  // Canvas references for the three charts
  const fullChartRef = useRef(null);
  const exposuresOnlyRef = useRef(null);
  const interventionsOnlyRef = useRef(null);
  
  // State for inputs
const [selectedPreset, setSelectedPreset] = useState("Radiofrequency Radiation");
useEffect(() => {
  handlePresetChange({ target: { value: "Radiofrequency Radiation" } });
}, []);
  const [exposureType, setExposureType] = useState('Radiofrequency Radiation');
  const [exposureUnits, setExposureUnits] = useState('µW-h/m²');
const [isLogScale, setIsLogScale] = useState(false);
const [decimalPlaces, setDecimalPlaces] = useState(0);
  const [exposures, setExposures] = useState([
    { name: 'Baseline', value: 15 },
    { name: 'Activity 1', value: 10 },
    { name: 'Activity 2', value: 25 }
  ]);
  const [interventions, setInterventions] = useState([
    { name: 'Control 1', value: 12 },
    { name: 'Control 2', value: 18 }
  ]);
  const [levels, setLevels] = useState([
    { name: 'Optimal', value: 5, color: '#87d3c3', enabled: true },
    { name: 'Good', value: 20, color: '#879A39', enabled: true },
    { name: 'Moderate', value: 40, color: '#D0A215', enabled: true },
    { name: 'Unhealthy for Sensitive Groups', value: 60, color: '#DA702C', enabled: true },
    { name: 'Unhealthy', value: 80, color: '#D14D41', enabled: true },
    { name: 'Very Unhealthy', value: 100, color: '#a02f6f', enabled: true },
  ]);
  
  // Input handlers
  const [newExposureName, setNewExposureName] = useState('');
  const [newExposureValue, setNewExposureValue] = useState('');
  const [newInterventionName, setNewInterventionName] = useState('');
  const [newInterventionValue, setNewInterventionValue] = useState('');
const [newLevelName, setNewLevelName] = useState('');
const [newLevelValue, setNewLevelValue] = useState('');
const [newLevelColor, setNewLevelColor] = useState('#6f6e69'); // Default color for new levels
// Edit mode state
const [editingExposureIndex, setEditingExposureIndex] = useState(null);
const [editingInterventionIndex, setEditingInterventionIndex] = useState(null);
const [editExposureName, setEditExposureName] = useState('');
const [editExposureValue, setEditExposureValue] = useState('');
const [editInterventionName, setEditInterventionName] = useState('');
const [editInterventionValue, setEditInterventionValue] = useState('');
  
  const toggleLevel = (index) => {
    const updatedLevels = [...levels];
    updatedLevels[index] = {
      ...updatedLevels[index],
      enabled: !updatedLevels[index].enabled
    };
    setLevels(updatedLevels);
  };
// Handle preset selection change
const handlePresetChange = (e) => {
  const presetName = e.target.value;
  setSelectedPreset(presetName);
  
  const preset = exposurePresets.find(p => p.name === presetName);
  
  // If Custom is selected, don't change anything
  if (presetName === "Custom") {
    return;
  }
  
  // Update exposure type and units
  setExposureType(preset.name);
  setExposureUnits(preset.units);
  
  // Update reference levels
  setLevels(preset.levels);
  
  // Set appropriate scale based on values
  // For large numbers like in RF radiation, log scale might be better
  const maxLevel = Math.max(...preset.levels.map(l => l.value));
setIsLogScale(false); // always default to linear scale
};
  // Add new items to lists
  const addExposure = () => {
    if (newExposureName && newExposureValue && !isNaN(parseFloat(newExposureValue))) {
      setExposures([...exposures, { name: newExposureName, value: parseFloat(newExposureValue) }]);
      setNewExposureName('');
      setNewExposureValue('');
    }
  };
  
  const addIntervention = () => {
    if (newInterventionName && newInterventionValue && !isNaN(parseFloat(newInterventionValue))) {
      setInterventions([...interventions, { name: newInterventionName, value: parseFloat(newInterventionValue) }]);
      setNewInterventionName('');
      setNewInterventionValue('');
    }
  };
  
const addLevel = () => {
  if (newLevelName && newLevelValue && !isNaN(parseFloat(newLevelValue))) {
    setLevels([...levels, { 
      name: newLevelName, 
      value: parseFloat(newLevelValue),
      color: newLevelColor, 
      enabled: true 
    }]);
    setNewLevelName('');
    setNewLevelValue('');
    
    // If we add a custom level, switch to "Custom" preset
    setSelectedPreset("Custom");
  }
};

// Start editing items
const startEditExposure = (index) => {
  const exposure = exposures[index];
  setEditExposureName(exposure.name);
  setEditExposureValue(exposure.value.toString());
  setEditingExposureIndex(index);
};

const startEditIntervention = (index) => {
  const intervention = interventions[index];
  setEditInterventionName(intervention.name);
  setEditInterventionValue(intervention.value.toString());
  setEditingInterventionIndex(index);
};

// Save edited items
const saveEditExposure = () => {
  if (editExposureName && editExposureValue && !isNaN(parseFloat(editExposureValue)) && editingExposureIndex !== null) {
    const updatedExposures = [...exposures];
    updatedExposures[editingExposureIndex] = {
      name: editExposureName,
      value: parseFloat(editExposureValue)
    };
    setExposures(updatedExposures);
    cancelEditExposure();
  }
};

const saveEditIntervention = () => {
  if (editInterventionName && editInterventionValue && !isNaN(parseFloat(editInterventionValue)) && editingInterventionIndex !== null) {
    const updatedInterventions = [...interventions];
    updatedInterventions[editingInterventionIndex] = {
      name: editInterventionName,
      value: parseFloat(editInterventionValue)
    };
    setInterventions(updatedInterventions);
    cancelEditIntervention();
  }
};

// Cancel editing
const cancelEditExposure = () => {
  setEditingExposureIndex(null);
  setEditExposureName('');
  setEditExposureValue('');
};

const cancelEditIntervention = () => {
  setEditingInterventionIndex(null);
  setEditInterventionName('');
  setEditInterventionValue('');
};

// Reorder functions
const moveExposureUp = (index) => {
  if (index <= 0) return; // Can't move the first item up
  const updatedExposures = moveItemInArray(exposures, index, index - 1);
  setExposures(updatedExposures);
};

const moveExposureDown = (index) => {
  if (index >= exposures.length - 1) return; // Can't move the last item down
  const updatedExposures = moveItemInArray(exposures, index, index + 1);
  setExposures(updatedExposures);
};

const moveInterventionUp = (index) => {
  if (index <= 0) return; // Can't move the first item up
  const updatedInterventions = moveItemInArray(interventions, index, index - 1);
  setInterventions(updatedInterventions);
};

const moveInterventionDown = (index) => {
  if (index >= interventions.length - 1) return; // Can't move the last item down
  const updatedInterventions = moveItemInArray(interventions, index, index + 1);
  setInterventions(updatedInterventions);
};

// Helper function to move items in array
const moveItemInArray = (arr, fromIndex, toIndex) => {
  if (
    fromIndex < 0 || 
    fromIndex >= arr.length || 
    toIndex < 0 || 
    toIndex >= arr.length
  ) {
    return [...arr]; // Return copy of original array if indexes are invalid
  }
  
  const result = [...arr];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  return result;
};
  
  // Remove item from lists
  const removeExposure = (index) => {
    setExposures(exposures.filter((_, i) => i !== index));
  };
  
  const removeIntervention = (index) => {
    setInterventions(interventions.filter((_, i) => i !== index));
  };
  
const removeLevel = (index) => {
  setLevels(levels.filter((_, i) => i !== index));
  
  // If we remove a level, switch to "Custom" preset
  setSelectedPreset("Custom");
};

// Export the current state to clipboard
const exportState = () => {
  try {
    const state = {
      selectedPreset,
      exposureType,
      exposureUnits,
      isLogScale,
      decimalPlaces,
      exposures,
      interventions,
      levels
    };
    
    const stateString = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(stateString)
      .then(() => {
        alert('Chart state copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy to clipboard:', err);
        alert('Failed to copy to clipboard. See console for details.');
      });
  } catch (error) {
    console.error('Error exporting state:', error);
    alert('Error exporting state. See console for details.');
  }
};

// Import state from JSON
const importState = () => {
  try {
    const importText = document.getElementById('stateImportInput').value;
    if (!importText) {
      alert('Please paste a valid state JSON first.');
      return;
    }
    
    const state = JSON.parse(importText);
    
    // Validate required fields
    if (!state.exposures || !state.interventions || !state.levels) {
      alert('Invalid state format. Missing required data.');
      return;
    }
    
    // Update all state values
    if (state.selectedPreset) setSelectedPreset(state.selectedPreset);
    if (state.exposureType) setExposureType(state.exposureType);
    if (state.exposureUnits) setExposureUnits(state.exposureUnits);
    if (state.isLogScale !== undefined) setIsLogScale(state.isLogScale);
    if (state.decimalPlaces !== undefined) setDecimalPlaces(state.decimalPlaces);
    setExposures(state.exposures);
    setInterventions(state.interventions);
    setLevels(state.levels);
    
    // Populate the bulk input text fields with the imported data
    // Format exposures for bulk input
    if (state.exposures && state.exposures.length > 0) {
      const exposuresBulkText = state.exposures
        .map(exp => `${exp.name}${exp.value}`)
        .join('\n');
      const bulkExposuresInput = document.getElementById('bulkExposuresInput');
      if (bulkExposuresInput) {
        bulkExposuresInput.value = exposuresBulkText;
      }
    }
    
    // Format interventions for bulk input
    if (state.interventions && state.interventions.length > 0) {
      const interventionsBulkText = state.interventions
        .map(int => `${int.name}${int.value}`)
        .join('\n');
      const bulkInterventionsInput = document.getElementById('bulkInterventionsInput');
      if (bulkInterventionsInput) {
        bulkInterventionsInput.value = interventionsBulkText;
      }
    }
    
    // Clear the import textarea
    document.getElementById('stateImportInput').value = '';
    
    alert('Chart state imported successfully! Bulk input fields have been populated with the imported data.');
  } catch (error) {
    console.error('Error importing state:', error);
    alert('Error importing state. Please check that the JSON format is valid.');
  }
};
  // Debug - check if levels are being initialized correctly
  useEffect(() => {
    console.log("Levels updated:", levels);
  }, [levels]);
  
  // Common input style
  const inputStyle = "border border-gray-300 p-2 rounded bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent";
  
  // Function to draw a waterfall chart
  const drawWaterfallChart = (canvasRef, chartType) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: true,
      antialias: true,
      desynchronized: false
    });
    
    // Enable text antialiasing
    ctx.textRendering = "optimizeLegibility";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    // High-DPI support for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set the canvas size accounting for device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale all drawing operations by the device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Set canvas CSS size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up margins
    const margin = {
      top: 70,      // Increased top margin for title and spacing
      right: 40,
      bottom: 160,   // Increased bottom margin for angled labels
      left: 210     // Increased left margin by 50% (from 140 to 210)
    };
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Calculate data for waterfall chart based on chart type
    const data = [];
    let runningTotal = 0;
    
    // For full chart and exposures-only chart, add exposures
    if (chartType === 'full' || chartType === 'exposures') {
      exposures.forEach(exposure => {
        const start = runningTotal;
        runningTotal += exposure.value;
        data.push({
          name: exposure.name,
          start,
          end: runningTotal,
          value: exposure.value,
          type: 'exposure'
        });
      });
    } else if (chartType === 'interventions') {
      // For interventions chart, calculate total exposure without showing individual exposures
      exposures.forEach(exposure => {
        runningTotal += exposure.value;
      });
    }
    
    // Add current exposure total for all chart types
    const exposureTotal = runningTotal;
    data.push({
      name: 'Current exposure',
      start: 0,
      end: exposureTotal,
      value: exposureTotal,
      type: 'total'
    });
    
    // For full chart and interventions chart, add interventions and final total
    if (chartType === 'full' || chartType === 'interventions') {
      // Add interventions
      interventions.forEach(intervention => {
        const start = runningTotal - intervention.value;
        data.push({
          name: intervention.name,
          start,
          end: runningTotal,
          value: intervention.value,
          type: 'intervention'
        });
        runningTotal -= intervention.value;
      });
      
      // Add final total
      data.push({
        name: 'Final Total',
        start: 0,
        end: runningTotal,
        value: runningTotal,
        type: 'total'
      });
    }
    
    // Find max value for Y axis
    const maxValue = Math.max(
      ...data.map(item => Math.max(item.start, item.end)),
      ...levels.filter(level => level.enabled).map(level => level.value)
    ) * 1.1;
    
    // Set up scales - reverting to original approach but with function for flexibility
    const xScale = chartWidth / data.length;
    
    // Create yScale function that works for both linear and log scale
    const yScale = (value) => {
      if (isLogScale && value > 0) {
        // For log scale, map log(value) to pixel height
        // Adding 1 to all values to handle values between 0-1 better
        const logMax = Math.log10(maxValue + 1);
        const logValue = Math.log10(value + 1);
        return (logValue / logMax) * chartHeight;
      } else {
        // For linear scale or zero values, use simple proportion
        return (value / maxValue) * chartHeight;
      }
    };
    
    // Draw background
    ctx.fillStyle = colors.paper;
    ctx.fillRect(0, 0, width, height);
    
    // Draw chart title with dynamic exposure type and units based on chart type
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 18px "Instrument Sans", sans-serif';
    
    let title;
    if (chartType === 'full') {
      title = `Total ${exposureType} (${exposureUnits})`;
    } else if (chartType === 'exposures') {
      title = `Current ${exposureType} (${exposureUnits})`;
    } else if (chartType === 'interventions') {
      title = `${exposureType} Interventions (${exposureUnits})`;
    }
    
    ctx.fillText(title, width / 2, margin.top - 60);
    
    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.strokeStyle = colors.border;
    ctx.stroke();
    
    // Draw y-axis ticks and labels
    const tickCount = isLogScale ? 5 : 6; // Fewer ticks for log scale
    
    for (let i = 0; i <= tickCount; i++) {
      let value;
      
      if (isLogScale) {
        // For log scale, calculate nice tick values
        if (maxValue <= 0) continue; // Skip if no positive values
        const logMax = Math.log10(maxValue);
        const exponent = logMax * (i / tickCount);
        value = Math.pow(10, exponent);
      } else {
        // For linear scale, evenly spaced ticks
        value = (i / tickCount) * maxValue;
      }
      
      const tickY = height - margin.bottom - yScale(value);
      
      // Draw tick line
      ctx.beginPath();
      ctx.moveTo(margin.left - 5, tickY);
      ctx.lineTo(margin.left, tickY);
      ctx.strokeStyle = colors.text;
      ctx.stroke();
      
      // Draw tick label
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '10px "Instrument Sans", sans-serif';
      
      // Format the label based on value size
      let label;
      if (value >= 1000) {
        label = (value / 1000).toFixed(1) + 'k';
      } else if (value < 0.01 && value > 0) {
        label = value.toExponential(1);
      } else {
        label = value.toFixed(1);
      }
      
      ctx.fillText(label, margin.left - 8, tickY);
    }
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.strokeStyle = colors.border;
    ctx.stroke();
    
    // Draw bars
    const barWidth = xScale * 0.7;
    const barSpacing = xScale * 0.15;
    
    data.forEach((item, index) => {
      const x = margin.left + barSpacing + index * xScale;
      
      // Calculate bar positions
      const startY = height - margin.bottom - yScale(item.start);
      const endY = height - margin.bottom - yScale(item.end);
      const barHeight = Math.abs(startY - endY);
      
      // Determine color based on type
      let color;
      if (item.type === 'exposure') {
        color = colors.red;
      } else if (item.type === 'intervention') {
        color = colors.green;
      } else {
        color = colors.neutral;
      }
      
      // Draw bar with rounded corners
      ctx.fillStyle = color;
      const cornerRadius = 4; // Radius for the rounded corners
      
      if (item.type === 'total') {
        // For totals, draw with rounded corners at both top and bottom
        const y = height - margin.bottom - yScale(item.end);
        const barHeightTotal = yScale(item.end);
        
        ctx.beginPath();
        // Start from bottom-left corner + radius
        ctx.moveTo(x, height - margin.bottom - cornerRadius);
        // Draw bottom-left rounded corner
        ctx.quadraticCurveTo(x, height - margin.bottom, x + cornerRadius, height - margin.bottom);
        // Draw line to bottom-right corner - radius
        ctx.lineTo(x + barWidth - cornerRadius, height - margin.bottom);
        // Draw bottom-right rounded corner
        ctx.quadraticCurveTo(x + barWidth, height - margin.bottom, x + barWidth, height - margin.bottom - cornerRadius);
        // Draw line to top-right corner + radius
        ctx.lineTo(x + barWidth, y + cornerRadius);
        // Draw top-right rounded corner
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth - cornerRadius, y);
        // Draw line to top-left corner - radius
        ctx.lineTo(x + cornerRadius, y);
        // Draw top-left rounded corner
        ctx.quadraticCurveTo(x, y, x, y + cornerRadius);
        // Draw line back to bottom-left corner + radius
        ctx.lineTo(x, height - margin.bottom - cornerRadius);
        ctx.fill();
    
      } else {
        // For regular bars, draw with all rounded corners
        const y = Math.min(startY, endY);
        
        // Only apply rounded corners if the bar is tall enough
        if (barHeight > cornerRadius * 2) {
          ctx.beginPath();
          // Start from top-left + radius
          ctx.moveTo(x + cornerRadius, y);
          // Draw line to top-right - radius
          ctx.lineTo(x + barWidth - cornerRadius, y);
          // Draw top-right rounded corner
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + cornerRadius);
          // Draw line to bottom-right - radius
          ctx.lineTo(x + barWidth, y + barHeight - cornerRadius);
          // Draw bottom-right rounded corner
          ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - cornerRadius, y + barHeight);
          // Draw line to bottom-left + radius
          ctx.lineTo(x + cornerRadius, y + barHeight);
          // Draw bottom-left rounded corner
          ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - cornerRadius);
          // Draw line to top-left + radius
          ctx.lineTo(x, y + cornerRadius);
          // Draw top-left rounded corner
          ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
          ctx.fill();
        } else {
          // If bar is too short for rounded corners, just draw rectangle
          ctx.beginPath();
          ctx.rect(x, y, barWidth, barHeight);
          ctx.fill();
        }
        
      }
      
      
// Draw bar value with thousands separators and configurable decimal places
ctx.fillStyle = colors.text;
ctx.textAlign = 'center';
ctx.textBaseline = 'bottom';
ctx.font = 'bold 12px "Instrument Sans", sans-serif';

if (item.type === 'total') {
  // For totals, place text at the top
  const y = height - margin.bottom - yScale(item.end) - 5;
  ctx.fillText(item.value.toLocaleString(undefined, {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces}), x + barWidth / 2, y);
} else if (item.type === 'intervention') {
  // For interventions, place text above the bar
  const y = endY - 5; // endY is the top of the intervention bar
  ctx.fillText(item.value.toLocaleString(undefined, {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces}), x + barWidth / 2, y);
} else {
  // For exposures, place text above the bar
  const y = endY - 5;
  ctx.fillText(item.value.toLocaleString(undefined, {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces}), x + barWidth / 2, y);
}
      
    });
// Draw x-axis labels
data.forEach((item, index) => {
  const x = margin.left + barSpacing + index * xScale + barWidth / 2;
  const y = height - margin.bottom + 15;
  
  // Draw angled x-axis label with improved text rendering
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4); // 45 degrees
  
  // Use a slightly larger font and scale down for better antialiasing
  const fontSize = 12;
  const scaleFactor = 1.5;
  ctx.scale(1/scaleFactor, 1/scaleFactor);
  
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${fontSize * scaleFactor}px "Instrument Sans", sans-serif`;
  
  // Apply a very slight shadow to mask aliasing
  ctx.shadowColor = colors.paper;
  ctx.shadowBlur = 0.5;
  ctx.shadowOffsetX = 0.3;
  ctx.shadowOffsetY = 0.3;
  
  // Split long text into multiple lines if needed
  const maxLineLength = 30; // Length of "move bed away from walls"
  let words = item.name.split(' ');
  let lines = [];
  let currentLine = words[0];
  
  // Create line breaks
  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + words[i].length + 1 <= maxLineLength) {
      currentLine += ' ' + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine); // Add the last line
  
  // Draw each line
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, i * (fontSize * 1.8)); // Add line spacing
  });
  
  ctx.restore();
});
    
    // Calculate spacing between level lines to avoid label overlap
    const enabledLevels = levels.filter(level => level.enabled);
    let minLevelSpacing = 40; // Minimum pixels between level lines
    
    // Check if we need to adjust spacing
    if (enabledLevels.length > 0) {
      // Get levels sorted by value
      const sortedLevels = [...enabledLevels].sort((a, b) => a.value - b.value);
      
      // Calculate current spacing between adjacent levels
      for (let i = 0; i < sortedLevels.length - 1; i++) {
        const currentY = height - margin.bottom - yScale(sortedLevels[i].value);
        const nextY = height - margin.bottom - yScale(sortedLevels[i + 1].value);
        const spacing = Math.abs(nextY - currentY);
        minLevelSpacing = Math.max(minLevelSpacing, spacing * 0.6); // At least 60% of calculated spacing
      }
    }
    
    // Draw level lines
    enabledLevels.forEach(level => {
      const y = height - margin.bottom - yScale(level.value);
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = level.color || colors.purple;
      ctx.stroke();
      ctx.setLineDash([]);
      
// Draw label to the left of the y-axis
const formattedValue = level.value >= 1000 ? level.value.toLocaleString() : level.value;
const labelText = `${level.name} (${formattedValue})`;
      
      // Setup for multiline text
      const maxWidth = margin.left - 50; // Reduce width to avoid overlap with axis labels
      const lineHeight = 16;
      const padding = 5;
      
      // Word wrap function to split text into lines
      const getLines = (ctx, text, maxWidth) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + ' ' + word).width;
          if (width < maxWidth) {
            currentLine += ' ' + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };
      
      // Get wrapped lines
      const lines = getLines(ctx, labelText, maxWidth - padding * 2);
      // Reduce vertical padding significantly for more compact labels
      const labelHeight = lines.length * lineHeight + padding * 2;
      const verticalPadding = padding; // Reduced from calculation to fixed small padding
      const labelWidth = Math.min(
        Math.max(...lines.map(line => ctx.measureText(line).width)) + padding * 2,
        maxWidth
      );
      const labelX = margin.left - labelWidth - 40; // Position further left to avoid y-axis labels
      const labelY = y - labelHeight / 2;
      
      // Draw background for label with increased opacity
      ctx.fillStyle = `${level.color || colors.purple}40`; // Increased opacity from 20 to 40
      
      // Add a soft shadow to make labels stand out from background
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Rounded rectangle for label background
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(labelX + radius, labelY);
      ctx.lineTo(labelX + labelWidth - radius, labelY);
      ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius);
      ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius);
      ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight);
      ctx.lineTo(labelX + radius, labelY + labelHeight);
      ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius);
      ctx.lineTo(labelX, labelY + radius);
      ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY);
      ctx.fill();
      
      // Add border to make the label more defined
      ctx.shadowColor = 'transparent'; // Disable shadow for the border
      ctx.lineWidth = 1;
      ctx.strokeStyle = `${level.color || colors.purple}90`; // Semi-transparent border matching the level color
      ctx.stroke();
      
      // Draw label text - line by line with bolder font
      ctx.fillStyle = level.color || colors.purple;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px "Instrument Sans", sans-serif'; // Added 'bold' to make text stand out more
      
      // First draw a subtle text shadow/outline to improve legibility
      ctx.shadowColor = 'rgba(255,255,255,0.7)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0.5;
      ctx.shadowOffsetY = 0.5;
      
      lines.forEach((line, i) => {
        const lineY = labelY + verticalPadding + i * lineHeight + lineHeight / 2;
        ctx.fillText(line, labelX + padding, lineY);
      });
      
      // Reset shadow for subsequent drawings
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
    
// Draw legend based on chart type
// Position higher between title and top of chart with dynamic spacing
const legendY = margin.top - 30; // Position higher, halfway between title and chart
let legendItems = [];

// Determine which legend items to show based on chart type
if (chartType === 'full') {
  legendItems = [
    { label: 'Exposures', color: colors.red },
    { label: 'Interventions', color: colors.green },
    { label: 'Totals', color: colors.neutral }
  ];
} else if (chartType === 'exposures') {
  legendItems = [
    { label: 'Exposures', color: colors.red },
    { label: 'Totals', color: colors.neutral }
  ];
} else if (chartType === 'interventions') {
  legendItems = [
    { label: 'Interventions', color: colors.green },
    { label: 'Totals', color: colors.neutral }
  ];
}

// Calculate legend width dynamically based on estimates
const legendHeight = 30; // Fixed height for horizontal layout
const estimatedItemWidth = 100; // Rough estimate for positioning the background
const legendWidth = legendItems.length * estimatedItemWidth;
const legendX = width - margin.right - legendWidth;

// Draw legend background box
ctx.fillStyle = '#FFFCF0';
ctx.strokeStyle = colors.border;
ctx.lineWidth = 1;

// Draw rounded rectangle
const boxRadius = 5;
ctx.beginPath();
ctx.moveTo(legendX - 10, legendY - 5 + boxRadius);
ctx.lineTo(legendX - 10, legendY - 5 + legendHeight - boxRadius);
ctx.quadraticCurveTo(legendX - 10, legendY - 5 + legendHeight, legendX - 10 + boxRadius, legendY - 5 + legendHeight);
ctx.lineTo(legendX - 10 + legendWidth + 10 - boxRadius, legendY - 5 + legendHeight);
ctx.quadraticCurveTo(legendX - 10 + legendWidth + 10, legendY - 5 + legendHeight, legendX - 10 + legendWidth + 10, legendY - 5 + legendHeight - boxRadius);
ctx.lineTo(legendX - 10 + legendWidth + 10, legendY - 5 + boxRadius);
ctx.quadraticCurveTo(legendX - 10 + legendWidth + 10, legendY - 5, legendX - 10 + legendWidth + 10 - boxRadius, legendY - 5);
ctx.lineTo(legendX - 10 + boxRadius, legendY - 5);
ctx.quadraticCurveTo(legendX - 10, legendY - 5, legendX - 10, legendY - 5 + boxRadius);
ctx.fill();
ctx.stroke();

// First measure text widths to position items with minimal spacing
ctx.font = '12px "Instrument Sans", sans-serif';
const padding = 20; // Space between items
const squareWidth = 15;
const squareTextGap = 5; // Gap between square and text

// Calculate positions based on text widths
let currentX = legendX;
const verticalCenter = legendY - 5 + (legendHeight / 2);

// Draw legend items horizontally with compact spacing
legendItems.forEach((item, index) => {
  // Draw color square
  ctx.fillStyle = item.color;
  ctx.fillRect(currentX, verticalCenter - 7, squareWidth, 15);
  
  // Draw label
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.label, currentX + squareWidth + squareTextGap, verticalCenter);
  
  // Calculate width of this item for positioning the next item
  const textWidth = ctx.measureText(item.label).width;
  const itemWidth = squareWidth + squareTextGap + textWidth;
  
  // Move to next position
  currentX += itemWidth + padding;
});
    
  };
  
  // Draw the three different charts
useEffect(() => {
  drawWaterfallChart(fullChartRef, 'full');
  drawWaterfallChart(exposuresOnlyRef, 'exposures');
  drawWaterfallChart(interventionsOnlyRef, 'interventions');
}, [exposures, interventions, levels, exposureType, exposureUnits, isLogScale, decimalPlaces]);
  
  return (
    <div className="App flex flex-col p-4 max-w-6xl mx-auto" style={{ 
      backgroundColor: colors.background,
      fontFamily: '"Instrument Sans", system-ui, sans-serif',
      color: colors.text
    }}>
      {/* Import Instrument Sans font */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');
        `}
      </style>
      <h1 className="text-2xl font-light text-center mb-6" style={{ letterSpacing: '0.5px' }}>
        exposure balance
      </h1>
      
      {/* Exposure Type and Units Input */}
<div className="rounded-lg p-5 mb-6" style={{ backgroundColor: colors.paper, border: `1px solid ${colors.border}` }}>
  <h2 className="text-lg font-medium mb-3">exposure details</h2>
  
  {/* Add dropdown selector for exposure presets */}
  <div className="mb-4">
    <label className="block text-sm mb-1">exposure type preset</label>
    <select
      value={selectedPreset}
      onChange={handlePresetChange}
      className={`${inputStyle} w-full`}
    >
      {exposurePresets.map(preset => (
        <option key={preset.name} value={preset.name}>
          {preset.name}
        </option>
      ))}
    </select>
  </div>
  
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">exposure type</label>
            <input
              type="text"
              value={exposureType}
              onChange={(e) => setExposureType(e.target.value)}
              placeholder="e.g. Radiofrequency Radiation"
              className={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">units</label>
            <input
              type="text"
              value={exposureUnits}
              onChange={(e) => setExposureUnits(e.target.value)}
              placeholder="e.g. µW-h/m²"
              className={inputStyle}
            />
          </div>
          <div>
  <label className="block text-sm mb-1">scale type</label>
  <div className="flex items-center mt-2">
    <div 
      className="relative inline-block w-12 h-6 transition-all duration-200 ease-in-out rounded-full cursor-pointer"
      style={{ 
        backgroundColor: isLogScale ? colors.purple : colors.border,
      }}
      onClick={() => setIsLogScale(!isLogScale)}
    >
      <div 
        className="absolute w-4 h-4 transition-all duration-200 ease-in-out transform rounded-full shadow-md top-1"
        style={{ 
          backgroundColor: 'white',
          left: isLogScale ? '26px' : '6px',
        }}
      ></div>
    </div>
    <span className="ml-2 text-sm">
      {isLogScale ? 'Logarithmic' : 'Linear'} Scale
    </span>
  </div>
</div>
<div>
  <label className="block text-sm mb-1">decimal places</label>
  <select
    value={decimalPlaces}
    onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
    className={`${inputStyle} w-full`}
  >
    <option value="0">0 decimal places</option>
    <option value="1">1 decimal place</option>
    <option value="2">2 decimal places</option>
    <option value="3">3 decimal places</option>
  </select>
</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
 {/* Exposures Bulk Input */}
<div className="rounded-lg p-5" style={{ backgroundColor: colors.paper, border: `1px solid ${colors.border}` }}>
  <h2 className="text-lg font-medium mb-3" style={{ color: colors.red }}>exposures</h2>
  
  <div className="mb-4">
    <label className="block text-sm mb-1">Bulk Input (format: LocationName123)</label>
    <textarea
      placeholder="Primary Bedroom171.429&#10;Lounge2571&#10;Living Room1114&#10;Nursery789"
      className="w-full border border-gray-300 p-2 rounded bg-white h-32 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
      id="bulkExposuresInput"
    />
  </div>
  
  <div className="flex space-x-2">
    <button
      onClick={() => {
        try {
          const bulkText = document.getElementById('bulkExposuresInput').value;
          const regex = /([^\d.,]+)([\d.,]+)/g;
          const matches = [...bulkText.matchAll(regex)];
          
          if (matches.length === 0) {
            alert('No valid data found. Please use the format: LocationName123');
            return;
          }
          
          const newExposures = matches.map(match => {
            const name = match[1].trim();
            const valueStr = match[2].replace(/,/g, '');
            const value = parseFloat(valueStr);
            return { name, value };
          });
          
          setExposures(newExposures);
        } catch (error) {
          alert('Error parsing input. Please check the format.');
          console.error('Parse error:', error);
        }
      }}
      className="px-4 py-2 rounded text-white"
      style={{ backgroundColor: colors.red }}
    >
      Update Exposures
    </button>
    
    <div className="text-sm" style={{ color: colors.textMuted }}>
      {exposures.length} exposure{exposures.length !== 1 ? 's' : ''} configured
    </div>
  </div>
  
  {/* Preview of current exposures */}
  {exposures.length > 0 && (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="text-sm font-medium mb-2">Current Exposures:</div>
      <div className="grid grid-cols-2 gap-2">
        {exposures.map((exp, index) => (
          <div key={index} className="text-sm px-2 py-1 bg-white rounded">
            <span className="font-medium">{exp.name}:</span> {exp.value}
          </div>
        ))}
      </div>
    </div>
  )}
</div>
      {/* Interventions Bulk Input */}
<div className="rounded-lg p-5" style={{ backgroundColor: colors.paper, border: `1px solid ${colors.border}` }}>
  <h2 className="text-lg font-medium mb-3" style={{ color: colors.green }}>interventions</h2>
  
  <div className="mb-4">
    <label className="block text-sm mb-1">Bulk Input (format: InterventionName123)</label>
    <textarea
      placeholder="Airplane Mode15.5&#10;Distance from Router8&#10;Move Bed12&#10;Shield Walls10"
      className="w-full border border-gray-300 p-2 rounded bg-white h-32 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
      id="bulkInterventionsInput"
    />
  </div>
  
  <div className="flex space-x-2">
    <button
      onClick={() => {
        try {
          const bulkText = document.getElementById('bulkInterventionsInput').value;
          const regex = /([^\d.,]+)([\d.,]+)/g;
          const matches = [...bulkText.matchAll(regex)];
          
          if (matches.length === 0) {
            alert('No valid data found. Please use the format: InterventionName123');
            return;
          }
          
          const newInterventions = matches.map(match => {
            const name = match[1].trim();
            const valueStr = match[2].replace(/,/g, '');
            const value = parseFloat(valueStr);
            return { name, value };
          });
          
          setInterventions(newInterventions);
        } catch (error) {
          alert('Error parsing input. Please check the format.');
          console.error('Parse error:', error);
        }
      }}
      className="px-4 py-2 rounded text-white"
      style={{ backgroundColor: colors.green }}
    >
      Update Interventions
    </button>
    
    <div className="text-sm" style={{ color: colors.textMuted }}>
      {interventions.length} intervention{interventions.length !== 1 ? 's' : ''} configured
    </div>
  </div>
  
  {/* Preview of current interventions */}
  {interventions.length > 0 && (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="text-sm font-medium mb-2">Current Interventions:</div>
      <div className="grid grid-cols-2 gap-2">
        {interventions.map((int, index) => (
          <div key={index} className="text-sm px-2 py-1 bg-white rounded">
            <span className="font-medium">{int.name}:</span> {int.value}
          </div>
        ))}
      </div>
    </div>
  )}
</div>
        
       {/* Reference Levels Table Input */}
<div className="rounded-lg p-5" style={{ backgroundColor: colors.paper, border: `1px solid ${colors.border}` }}>
  <h2 className="text-lg font-medium mb-3">reference levels</h2>
  
  {/* Table-based input */}
  <div className="mb-4 overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left pb-2 pr-2 font-medium text-sm">Level</th>
          <th className="text-left pb-2 px-2 font-medium text-sm">Value</th>
          <th className="text-left pb-2 px-2 font-medium text-sm">Color</th>
          <th className="text-right pb-2 pl-2 font-medium text-sm">Actions</th>
        </tr>
      </thead>
      <tbody>
        {levels.map((level, index) => (
          <tr key={index} className="border-t border-gray-200" style={{ 
            backgroundColor: `${level.color}10`,
            opacity: level.enabled ? 1 : 0.6
          }}>
            <td className="py-2 pr-2 flex items-center">
              <div className="w-3 h-3 mr-2" style={{ backgroundColor: level.color }}></div>
              {level.name}
            </td>
            <td className="py-2 px-2">
              <input
                type="number"
                value={level.value}
                onChange={(e) => {
                  const updatedLevels = [...levels];
                  updatedLevels[index] = {
                    ...updatedLevels[index],
                    value: parseFloat(e.target.value) || 0
                  };
                  setLevels(updatedLevels);
                  setSelectedPreset("Custom");
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                min="0"
                step="0.1"
              />
            </td>
            <td className="py-2 px-2">
              <input
                type="color"
                value={level.color}
                onChange={(e) => {
                  const updatedLevels = [...levels];
                  updatedLevels[index] = {
                    ...updatedLevels[index],
                    color: e.target.value
                  };
                  setLevels(updatedLevels);
                  setSelectedPreset("Custom");
                }}
                className="w-8 h-8 cursor-pointer rounded"
              />
            </td>
            <td className="py-2 pl-2 text-right">
              <div className="flex justify-end items-center space-x-1">
                <button 
                  type="button"
                  onClick={() => toggleLevel(index)}
                  className="px-2 py-1 rounded text-xs"
                  style={{ 
                    backgroundColor: level.enabled ? level.color : 'transparent',
                    color: level.enabled ? 'white' : level.color,
                    border: `1px solid ${level.color}`
                  }}
                >
                  {level.enabled ? 'On' : 'Off'}
                </button>
                <button 
                  type="button"
                  onClick={() => removeLevel(index)}
                  className="px-2 py-1 rounded-full text-xs hover:bg-red-50"
                  style={{ color: colors.red }}
                >
                  ×
                </button>
              </div>
            </td>
          </tr>
        ))}
        
        {/* Add new level row */}
        <tr className="border-t border-gray-200">
          <td className="py-2 pr-2">
            <input
              type="text"
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              placeholder="Level name"
              className={`${inputStyle} w-full`}
              style={{ height: '32px' }}
            />
          </td>
          <td className="py-2 px-2">
            <input
              type="number"
              value={newLevelValue}
              onChange={(e) => setNewLevelValue(e.target.value)}
              placeholder="Value"
              className={`${inputStyle} w-full`}
              style={{ height: '32px' }}
            />
          </td>
          <td className="py-2 px-2">
            <input
              type="color"
              value={newLevelColor}
              onChange={(e) => setNewLevelColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </td>
          <td className="py-2 pl-2 text-right">
            <button
              onClick={addLevel}
              className="px-2 py-1 rounded text-white"
              style={{ backgroundColor: colors.purple }}
            >
              Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
      </div>
      
      {/* Containers for the three charts */}
      <div className="space-y-8">
        {/* Full Chart */}
        <div className="rounded-lg p-5" style={{ backgroundColor: colors.paper, border: `1px solid ${colors.border}` }}>
          <canvas 
            ref={fullChartRef} 
            className="w-full"
            style={{ 
              maxWidth: '100%',
              display: 'block',
              height: '500px'
            }}
          />
        </div>
        
        {/* Exposures Only Chart */}
        <div className="rounded-lg p-5" style={{ backgroundColor: colors.paper, border: `1px solid ${colors.border}` }}>
          <canvas 
            ref={exposuresOnlyRef} 
            className="w-full"
            style={{ 
              maxWidth: '100%',
              display: 'block',
              height: '500px'
            }}
          />
        </div>
        
        {/* Interventions Only Chart */}
        <div className="rounded-lg p-5" style={{ backgroundColor: colors.paper, border: `1px solid ${colors.border}` }}>
          <canvas 
            ref={interventionsOnlyRef} 
            className="w-full"
            style={{ 
              maxWidth: '100%',
              display: 'block',
              height: '500px'
            }}
          />
        </div>
      </div>
      </div>
      {/* Export/Import State Section */}
      <div className="rounded-lg p-5 mt-8" style={{ backgroundColor: colors.paper, border: `1px solid ${colors.border}` }}>
        <h2 className="text-lg font-medium mb-3">Save & Load Chart State</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Export Button */}
          <div className="flex-1">
            <button
              onClick={exportState}
              className="w-full px-4 py-2 rounded text-white"
              style={{ backgroundColor: colors.accent }}
            >
              Export Chart State to Clipboard
            </button>
            <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
              Copies all chart settings, values, and configurations to your clipboard.
            </p>
          </div>
          
          {/* Import Section */}
          <div className="flex-1">
            <textarea
              id="stateImportInput"
              placeholder="Paste exported chart state JSON here..."
              className="w-full border border-gray-300 p-2 rounded bg-white h-24 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent mb-2"
            />
            <button
              onClick={importState}
              className="w-full px-4 py-2 rounded text-white"
              style={{ backgroundColor: colors.purple }}
            >
              Import Chart State
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-6 text-sm" style={{ color: colors.textMuted }}>
        visualize your exposure balance with this holistic wellness tool
      </div>
    </div>
  );
};

export default WaterfallChart;
