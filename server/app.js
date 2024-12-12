const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.use(express.json());

app.post('/read-meter', (req, res) => {
    const { serialPort, authentication, password, clientAddress, serverAddress, meterType } = req.body;
  
    // Default values
    const serial = serialPort || 'COM6';
    const auth = authentication || 'None';
    const pass = password || 'ABCD0001';
    const clientAddr = clientAddress || 16;
    const serverAddr = serverAddress || 1;
  
    console.log(`Executing Python script with: -S ${serial}:9600:8None1 -c ${clientAddr} -a ${auth} -P ${pass}`);
  
    // Construct the command based on meter type
    let command;
    if (meterType === 'secure') {
      command = `python D:/MRI/Gurux/Gurux.DLMS.Client.Example.python/main.py -S ${serial}:9600:8None1 -c ${clientAddr} -a ${auth} -P ${pass} -d India -w 1 -f 128 -t Verbose`;
    } else if (meterType === 'genus') {
      command = `python D:/MRI/Gurux/Gurux.DLMS.Client.Example.python/main.py -S ${serial}:9600:8None1 -c ${clientAddr} -a ${auth} -P ${pass} -d India -t Verbose`;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid meter type.' });
    }
  
    const pythonProcess = spawn(command, { shell: true });
  
    let pythonOutput = '';
    let pythonError = '';
  
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      pythonOutput += output;
      console.log(`STDOUT: ${output}`);
    });
  
    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      pythonError += error;
      console.error(`STDERR: ${error}`);
    });
  
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      if (code === 0) {
        res.json({
          success: true,
          message: 'Python script executed successfully.',
          output: pythonOutput.trim(),
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Python script execution failed.',
          error: pythonError.trim() || 'No specific error message captured.',
        });
      }
    });
  
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python script:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to start Python script.',
        error: err.message,
      });
    });
  });
  
  

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
