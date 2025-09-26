from flask import Flask, render_template, request, jsonify, Response, stream_with_context, send_from_directory, redirect, url_for, session, flash, abort
import subprocess
import template
import plotly
import plotly.express as px
import json
import pandas as pd
import os
from datetime import datetime
import shutil
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import threading
import queue
import time
import uuid
import requests
from urllib.parse import urlparse, parse_qs
import logging

logging.basicConfig(level=logging.DEBUG)
production = False
path = '/src/' if production else ''
app = Flask(__name__, template_folder= path + 'templates', static_folder= path + 'static')

static_folder = os.path.join(app.root_path, 'static')
app.secret_key = '2024@scgc'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET_FILE = os.path.join(BASE_DIR, 'reactor_pilot.exe')
ALLOWED_EXTENSIONS = {'exe'}

# Initialize global variables
datetime_suffix = ""
task_queue = queue.Queue()
output_queue = queue.Queue()
plots = []
PLOT_FILE = 'plots.json'

file_name  = ""
file_description = ""
dimensions = ""
input_data = ""
current_task = None
task_lock = threading.Lock()

# Load saved plots if available
if os.path.exists(PLOT_FILE):
    with open(PLOT_FILE, 'r') as f:
        plots = json.load(f)
else:
    plots = []

# Function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Save plots to file
def save_plots():
    with open(PLOT_FILE, 'w') as f:
        json.dump(plots, f)

# Load plots from file
def load_plots():
    if os.path.exists(PLOT_FILE):
        with open(PLOT_FILE, 'r') as file:
            return json.load(file)
    return []

def run_task(task):
    global current_task
    with task_lock:
        current_task = task
    task()
    with task_lock:
        current_task = None

def worker():
    while True:
        task, event = task_queue.get()
        if task is None:
            break

        try:
            task()
        except Exception as e:
            logging.error(f"Error running task: {e}")
        finally:
            task_queue.task_done()
            if event:
                event.set()
                logging.debug("Worker: task_done event set.")
        time.sleep(5)

# Start the worker thread
threading.Thread(target=worker, daemon=True).start()

# Function to copy and rename a file
def copy_and_rename_file(original_path, new_filename):
    destination_path = os.path.join('static', new_filename)
    shutil.copy(original_path, destination_path)
    return destination_path

# Function to extract a column from a file
def extract_column(file_path, column_index):
    column_data = []
    with open(file_path, 'r') as file:
        next(file)  # Skip header row
        for line in file:
            columns = line.split()
            if columns and len(columns) > column_index:
                try:
                    column_data.append(float(columns[column_index]))
                except ValueError:
                    continue
    return column_data

# Function to extract time data from a file
def extract_time(file_path):
    time_data = []
    with open(file_path, 'r') as file:
        next(file)  # Skip header row
        for line in file:
            columns = line.split()
            if columns:
                try:
                    time_data.append(float(columns[0]))
                except ValueError:
                    continue
    return time_data

# Function to create a plot from a file
def create_plot(file_path="Pilot040.roi"):
    time = extract_time(file_path)
    second_column = extract_column(file_path, 1)  # Conversion
    fifth_column = extract_column(file_path, 4)   # Temperature
    third_column = extract_column(file_path, 2)   # Polymerization Rate
    sixth_column = extract_column(file_path, 5)   # Pressure

    # Create figure with secondary y-axis
    fig = make_subplots(specs=[[{"secondary_y": True}]])

    # Add traces
    fig.add_trace(
        go.Scatter(x=time, y=second_column, name="Conversion (%)"),
        secondary_y=False,
    )
    fig.add_trace(
        go.Scatter(x=time, y=fifth_column, name="Temperature (°C)"),
        secondary_y=False,
    )
    fig.add_trace(
        go.Scatter(x=time, y=third_column, name="Polymerization Rate (kg/m^3/min)"),
        secondary_y=True,
    )
    fig.add_trace(
        go.Scatter(x=time, y=sixth_column, name="Pressure (bar)"),
        secondary_y=True,
    )

    # Update layout with autoscaled ranges
    fig.update_layout(
        xaxis_title='Time (min)',
        yaxis_title='Conversion (%) and Temperature (°C)',
        yaxis2_title='Polymerization Rate (kg/m^3/min) and Pressure (bar)',
        yaxis=dict(
            title='Conversion (%) and Temperature (°C)',
            position=0.05    # Adjust position of the first y-axis
        ),
        yaxis2=dict(
            title='Polymerization Rate (kg/m^3/min) and Pressure (bar)',
            overlaying='y',
            side='right',
            position=0.95    # Adjust position of the second y-axis
        )
    )

    return fig  # Return the Plotly figure object

# Function to run reactor pilot simulation
def run_reactor_pilot():
    try:
        logging.debug("run_reactor_pilot: Starting subprocess.")
        process = subprocess.Popen(
            ['reactor_pilot.exe'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        for line in iter(process.stdout.readline, ''):
            logging.debug(f"run_reactor_pilot output: {line.strip()}")
            yield f"{line.strip()}<br/>\n"  # Ensure lines are flushed correctly
        process.stdout.close()
        process.wait()
        logging.debug("run_reactor_pilot: Subprocess completed.")
    except FileNotFoundError as e:
        logging.error(f"run_reactor_pilot error: File not found - {e}")
        yield f"Error: {e}<br/>\n"
    except Exception as e:
        logging.error(f"run_reactor_pilot error: {e}")
        yield f"Error: {e}<br/>\n"

def extract_code_from_url(url):
    # Parse the URL to get the query string
    parsed_url = urlparse(url)
    query_string = parsed_url.query
    
    # Parse the query string to get the parameters
    params = parse_qs(query_string)
    
    # Extract the 'code' parameter
    code = params.get('code', [None])[0]
    
    return code

@app.route('/login')
def login():
    # url = 'https://scgchem-sso.scg.com/api/login/SCGC/669f2d77d9899c71499f15d4'
    url = 'https://scgchem-sso.scg.com/api/login/669f2c9bd9899c71499f1563'
    session['logged_in'] = True
    return redirect(url)

# Index page
@app.route('/')
def index():
    session['allowed'] = True
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    
    if 'token_id' not in session or not session['token_id']:
        current_url = request.url
        session["login_id"] = extract_code_from_url(current_url)
        token_response = requests.post(
            'https://scgchem-sso.scg.com/api/token',
            json={"code": session["login_id"]}
        ).json()
        session["token_id"] = token_response.get('token')

        # session["profile"] = requests.post(
        #     'https://scgchem-sso.scg.com/api/profile/669f2d77d9899c71499f15d4',
        #     headers={
        #         "Authorization": "Bearer " + session["token_id"]
        #     }
        # ).json()

        session["profile"] = requests.post(
            'https://scgchem-sso.scg.com/api/profile/669f2c9bd9899c71499f1563',
            headers={
                "Authorization": "Bearer " + session["token_id"]
            }
        ).json()

    session["role"] = next((role['name'] for role in session.get("profile", {}).get('roles', []) if role['name'] == 'Admin'), None)
    
    return render_template('index.html')

# Logout
@app.route('/logout')
def logout():
    requests.post(
            'https://scgchem-sso.scg.com/api/revoke',
            headers={
                "Authorization": "Bearer " + session["token_id"]
            }
        )
    session.clear()
    # sso_url = "https://scgchem-sso.scg.com/api/logout/SCGC/669f2d77d9899c71499f15d4"
    sso_url = "https://scgchem-sso.scg.com/api/logout/SCGC/669f2c9bd9899c71499f1563"
    return redirect(sso_url)

# General user page
@app.route('/general_user')
def general_user():
    return render_template('general_user.html')

# Advanced user page
@app.route('/advanced_user')
def advanced_user():
    return render_template('advanced_user.html')

# Plot Temp vs Time in General user page
@app.route('/temp_plot', methods=['POST'])
def plot():
    data = request.json

    combined_data = []
    global time_data
    for row in data:
        if row['temperature'] == "" or row['time'] == "":
            continue
        combined_data.append(float(row['time']))
        combined_data.append(float(row['temperature']))

    time_data = combined_data

    times = combined_data[::2]
    temperatures = combined_data[1::2]

    df = pd.DataFrame({'Time (min)': times, 'Temperature (°C)': temperatures})
    fig = px.line(df, x='Time (min)', y='Temperature (°C)', title='Temperature vs Time')

    fig.update_layout(
        width=700,  # Set width
        height=600,  # Set height
    )

    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return jsonify(graphJSON)

# Loading screen after click run simulation in general user
@app.route('/save_run', methods=['POST'])
def save_run():
    # Check if the user is allowed to access this route
    if 'allowed' not in session or not session['allowed']:
        return redirect(url_for('index'))

    # Set the session variable to indicate the simulation is running
    session['allowed'] = False
    return render_template('loading.html')

# Loading screen after click run simulation in advanced user
@app.route('/save_run_advanced', methods=['POST'])
def save_run_advanced():
    return render_template('loading_advanced.html')

# Endpoint to get file_name,  file_description, dimensions from user input and save it as .json
@app.route("/process_name", methods=['POST'])
def process_name():
    global file_name
    global file_description
    global dimensions
    data = request.get_json()
    
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400
    
    try:
        file_name = data.get('name')
        file_description = data.get('description')
        dimensions = data.get('dimensions')
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/start_simulation', methods=['POST'])
def start_simulation():
    try:
        data = request.get_json()
        if not isinstance(data, list):
            return jsonify({'error': 'Expected a list of values'}), 400

        original_template = template.template_general
        expected_num_values = original_template.count('{}')
        if len(data) != expected_num_values:
            return jsonify({'error': f'Expected {expected_num_values} values, got {len(data)}'}), 400

        # Prepare the template and file data
        modified_template = original_template.format(*data)
        template_filename = 'Pilot040.rin'

        def task():
            try:
                # Write the modified template to the file inside the task
                with open(template_filename, 'w') as file:
                    file.write(modified_template)
                
                logging.debug("Task: Starting reactor pilot.")
                output = list(run_reactor_pilot())
                logging.debug("Task: Reactor pilot task completed.")
            except Exception as e:
                logging.error(f"Task execution failed: {e}")
            finally:
                with task_lock:
                    global current_task
                    current_task = None
                    logging.debug("Task: current_task reset to None.")
                task_done.set()

        task_done = threading.Event()
        task_queue.put((task, task_done))
        logging.debug("Task added to queue.")

        return jsonify({"status": "success", "message": "Simulation scheduled"})
    except Exception as e:
        logging.error(f"start_simulation error: {e}")
        return jsonify({'error': str(e)}), 500

# Yield the simulation process
@app.route('/run_reactor', methods=['GET'])
def run_reactor():
    def generate():
        task_done = threading.Event()
        output = []

        def task():
            try:
                logging.debug("generate: Starting reactor pilot task.")
                output.extend(run_reactor_pilot())
                logging.debug("generate: Reactor pilot task completed.")
            except Exception as e:
                logging.error(f"generate task execution failed: {e}")
            finally:
                task_done.set()

        task_queue.put((task, task_done))
        logging.debug("run_reactor: Task added to queue.")

        task_done.wait()
        logging.debug("run_reactor: Task done waiting.")

        for line in output:
            yield f"{line}<br/>\n"

    logging.debug("run_reactor: Starting response streaming.")
    return Response(stream_with_context(generate()))

# For debugging output in the loading.html (press F12)
@app.route('/get_output')
def get_output():
    output = []
    while not output_queue.empty():
        output.append(output_queue.get())
    return jsonify(output=output)

# Read a notepad after start simulation (for advanced user)
@app.route('/start_simulation_advanced', methods=['POST'])
def start_simulation_advanced():
    try:
        # Check if file part is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Save the uploaded file
        uploads_dir = 'uploads'
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, file.filename)
        file.save(file_path)

        # Read the uploaded file content
        with open(file_path, 'r') as f:
            modified_template = f.read()

        # Write the modified content to Pilot040.rin
        with open('Pilot040.rin', 'w') as f:
            f.write(modified_template)

        return render_template('loading.html')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Show the plot result
@app.route('/result', methods=['POST'])
def result():
    fig = create_plot()

    # Ensure fig is a Plotly Figure object
    if not isinstance(fig, go.Figure):
        return "Error: create_plot() did not return a Plotly Figure object"

    # Generate a unique ID and timestamp
    plot_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    safe_timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    img_filename = file_name+"_"+f'{safe_timestamp}.png'
    roi_filename = file_name+"_"+f'{safe_timestamp}.roi'
    img_path = os.path.join('static', img_filename)
    roi_path = os.path.join('static', roi_filename)

    # Adjust the layout for high-quality image export
    fig.update_layout(
        width=1280,
        height=720,
        xaxis_title='Time (min)',
        yaxis_title='Conversion (%) and Temperature (°C)',
        yaxis2_title='Polymerization Rate (kg/m^3/min) and Pressure (bar)',
    )

    # Save the image directly to the file
    fig.write_image(img_path, format='png', scale=2)

    # Read the original .roi file and save it to the specified path
    with open('Pilot040.roi', 'rb') as roi_file:
        roi_bytes = roi_file.read()
    with open(roi_path, 'wb') as roi_out:
        roi_out.write(roi_bytes)

    # Convert Plotly Figure to JSON string
    plot_json = fig.to_json()

    # Store the plot details in the list
    username = session.get('username', 'unknown')

    plots.append({
        'plot_id': plot_id,
        'timestamp': timestamp,
        'plot_json': plot_json,
        'img_path': img_filename,
        'roi_path': roi_filename,
        "name": file_name,
        "description": file_description,
        "dimensions": dimensions,
        "input_data": input_data,
        "created_by": session["profile"].get("name"),
        "output_data": [extract_column("Pilot040.roi", 1)[-1],extract_column("Pilot040.roi", 4)[-1] # Cov Temp
                        ,extract_column("Pilot040.roi", 2)[-1],extract_column("Pilot040.roi", 5)[-1]] # Pol_rate Pressure
    })

    # Save the plots to the JSON file
    save_plots()
    return redirect(url_for('result_page', plot_id=plot_id))

# Endpoint for view the specific plot result
@app.route('/result/<plot_id>')
def result_page(plot_id):
    plot = next((p for p in plots if p['plot_id'] == plot_id), None)
    if plot:
        return render_template('result.html', plot=plot)
    else:
        return "Plot not found", 404

# View all of the plot results
@app.route('/plots')
def view_plots():
    if not session.get('logged_in'):
        return redirect(url_for('login'))

    username = session["profile"].get("name")
    role = session["role"]
    plots = load_plots()

    if role == 'Admin':
        user_plots = plots  # Admin can see all plots
    else:
        user_plots = [plot for plot in plots if plot['created_by'] == username]  # Regular user can see only their plots

    return render_template('plots.html', plots=user_plots)

# Delete the spicific plot
@app.route('/delete_plot')
def delete_plot():
    plot_id = request.args.get('plot_id')
    global plots
    plot = next((p for p in plots if p['plot_id'] == plot_id), None)
    if plot:
        plots = [plot for plot in plots if plot['plot_id'] != plot_id]

        # Construct file paths for .png and .roi files
        png_file_path = os.path.join(app.root_path, 'static', plot['img_path'])
        roi_file_path = os.path.join(app.root_path, 'static', plot['roi_path'])

        # Delete the .png file if it exists
        if os.path.exists(png_file_path):
            os.remove(png_file_path)

        # Delete the .roi file if it exists
        if os.path.exists(roi_file_path):
            os.remove(roi_file_path)

        # Update plots.json
        plots_json_path = os.path.join(app.root_path, 'plots.json')
        if os.path.exists(plots_json_path):
            with open(plots_json_path, 'r') as file:
                plots_data = json.load(file)
            plots_data = [plot for plot in plots_data if plot['plot_id'] != plot_id]
            with open(plots_json_path, 'w') as file:
                json.dump(plots_data, file, indent=4)
    
    return redirect(url_for('view_plots'))

# Compare the plot result with the existing plot and uploaded plot
@app.route("/compare", methods=["GET", "POST"])
def compare():
    if request.method == "POST":
        # Get the JSON data and names for the existing and uploaded plots from the form
        plot1_json = request.form.get('plot1')
        plot2_json = request.form.get('plot2')
        plot1_name = request.form.get('plot1_name')
        plot2_name = request.form.get('plot2_name')

        if not plot1_json or not plot2_json:
            return "Error: Missing plot data.", 400

        try:
            plot1_data = json.loads(plot1_json)
            plot2_data = json.loads(plot2_json)
        except json.JSONDecodeError:
            return "Error: Invalid JSON data for plots.", 400

        # Ensure both data sets are lists before combining them
        plot1_data_list = plot1_data['data'] if isinstance(plot1_data['data'], list) else [plot1_data['data']]
        plot2_data_list = plot2_data['data'] if isinstance(plot2_data['data'], list) else [plot2_data['data']]

        # Modify legends in the second plot data
        for trace in plot1_data_list:
            if 'name' in trace:
                trace['name'] = f"{plot1_name} {trace['name']}"
            else:
                trace['name'] = plot1_name

        for trace in plot2_data_list:
            if 'name' in trace:
                trace['name'] = f"Uploaded {plot2_name} {trace['name']}"
            else:
                trace['name'] = f"Uploaded {plot2_name}"

        # Combine the two plots' data
        combined_data = plot1_data_list + plot2_data_list
        combined_layout = plot1_data.get('layout', {})

        combined_plot_json = {
            "data": combined_data,
            "layout": combined_layout
        }

        return render_template("compare.html", combined_graph_json=json.dumps(combined_plot_json, cls=plotly.utils.PlotlyJSONEncoder))
    
    return render_template("compare.html", error="Invalid request method.")

# Download sample input file in advanced user
@app.route("/download")
def download():
    directory = "./" 
    filename = "Pilot040.rin"
    return send_from_directory(directory, filename)

# Delete the uploaded file when user exit the compare page
@app.route('/delete_uploaded_graph', methods=['POST'])
def delete_uploaded_graph():
    uploaded_file_path = request.form.get('uploaded_file')
    if uploaded_file_path and os.path.exists(uploaded_file_path):
        os.remove(uploaded_file_path)
    return redirect(url_for('index'))

@app.route('/admin_upload', methods=['GET', 'POST'])
def admin_upload():
    if not session.get('logged_in') or session.get('role') != 'Admin':
        return redirect(url_for('login'))

    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            file.save(TARGET_FILE)
            flash('File successfully uploaded and replaced reactor_pilot.exe')
            return redirect(url_for('admin_upload'))
    return render_template('admin_upload.html')

# Get Inutiators .CSV
@app.route('/initiators')
def get_csv():
    return send_from_directory('static', 'initiators.csv')

if __name__ == '__main__':
    app.run(debug=True)
