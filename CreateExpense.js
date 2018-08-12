class CreateExpense extends Component {
    state = {
        expenseForm: {
            date: {
                elementType: 'input',
                elementConfig: {
                    type: 'date',
                    placeholder: 'Enter Date..'
                },
                value: '',
                validation: {
                    required: true,
                    isDate: true
                },
                valid: false,
                touched: false
            },
            category: {
                elementType: 'select',
                elementConfig: {
                    options: !this.props.loading ? transformCategory(this.props.categories): null
                },
                value: transformCategory(this.props.categories)[0].value,
                validation: {
                    required: true,
                    minLength: 4
                },
                valid: true,
                touched: false
            },
            description: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Enter Description..'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6
                },
                valid: false,
                touched: false
            },
            amount: {
                elementType: 'input',
                elementConfig: {
                    type: 'number',
                    placeholder: 'Enter amount..'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 1
                },
                valid: false,
                touched: false
            }
        },
        formIsValid: false
    }

    componentDidMount () {
        this.props.onCategoriesFetch(this.props.token);
        if(this.props.categories) {

            const updatedExpenseForm = updateObject( this.state.expenseForm, {
                category: updateObject( this.state.expenseForm.category, {
                    elementConfig: updateObject(this.state.expenseForm.category.elementConfig, {
                        options: transformCategory(this.props.categories)
                    }),
                })
            } );
            this.setState( { expenseForm: updatedExpenseForm } );
        }

    }

    inputChangedHandler = ( event, inputIdentifier ) => {
        const updatedFormElement = updateObject(this.state.expenseForm[inputIdentifier], {
            value: event.target.value,
            valid: checkValidity(event.target.value, this.state.expenseForm[inputIdentifier].validation),
            touched: true
        });
        const updatedExpenseForm = updateObject(this.state.expenseForm, {
            [inputIdentifier]: updatedFormElement
        });
        
        let formIsValid = true;
        for (let inputIdentifier in updatedExpenseForm) {
            formIsValid = updatedExpenseForm[inputIdentifier].valid && formIsValid;
        }
        this.setState({expenseForm: updatedExpenseForm, formIsValid: formIsValid});
    }

    submitHandler = ( event ) => {
        event.preventDefault();
        
        const expense = {userId:this.props.userId};
        for (let formElementIdentifier in this.state.expenseForm) {
            expense[formElementIdentifier] = this.state.expenseForm[formElementIdentifier].value;
        }
        try {
            this.props.onCreateExpense(expense, this.props.token);
            this.clearForm();
        } catch (error) {
            
        }
                   
    }

    clearForm = () => {
        for (let inputIdentifier in this.state.expenseForm) {
            //console.log('inputIdentifier--------------', inputIdentifier);
            const updatedFormElement = updateObject(this.state.expenseForm[inputIdentifier], {
                value: ''
            });
            //console.log('updatedFormElement--------------', updatedFormElement);
            const updatedExpenseForm = updateObject(this.state.expenseForm, {
                [inputIdentifier]: updatedFormElement
            });
        }
        
            this.setState({...this.state,expenseForm: updatedExpenseForm});
            //console.log('updatedExpenseForm--------------', updatedExpenseForm);
            //this.setState({expenseForm: updatedExpenseForm});
            console.log('state', this.state.expenseForm);
    }

    render () {
        const formElementsArray = [];
        for ( let key in this.state.expenseForm ) {
            formElementsArray.push( {
                id: key,
                config: this.state.expenseForm[key]
            } );
        }

        let form = formElementsArray.map( formElement => (
            <Input
                key={formElement.id}
                elementType={formElement.config.elementType}
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                invalid={!formElement.config.valid}
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
                changed={( event ) => this.inputChangedHandler( event, formElement.id )} />
        ) );

        if ( this.props.loading ) {
            form = <Spinner />
        }

        let errorMessage = null;

        if ( this.props.error ) {
            errorMessage = (
                <p>{this.props.error.message}</p>
            );
        }

        return (
            <div className={classes.CreateExpense}>
                {errorMessage}
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button btnType="Success" disabled={!this.state.formIsValid}>SUBMIT</Button>
                </form>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        categories: state.categories.categories,
        loading: state.categories.loading,
        token: state.auth.token,
        userId: state.auth.userId
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onCategoriesFetch: (token) => dispatch(actions.fetchCategories(token)),
        onCreateExpense: (expense, token) => dispatch( actions.createExpense(expense,token) )
    };
};

export default connect( mapStateToProps, mapDispatchToProps )( CreateExpense );
